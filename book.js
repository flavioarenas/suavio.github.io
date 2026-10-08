(function () {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-item]"));
    if (!items.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var openItem = null;
    var closeTimers = new WeakMap();

    function panelOf(item) {
        return item.querySelector(".summary");
    }

    function triggerOf(item) {
        return item.querySelector(".object");
    }

    function finishClose(item) {
        if (item.classList.contains("is-open")) return;
        if (item === openItem) return;
        panelOf(item).hidden = true;
    }

    function cancelClose(item) {
        var timer = closeTimers.get(item);
        if (timer) window.clearTimeout(timer);
        closeTimers.delete(item);
    }

    function scheduleClose(item) {
        cancelClose(item);
        if (reduce) {
            finishClose(item);
            return;
        }
        var panel = panelOf(item);
        var timer = window.setTimeout(function () {
            panel.removeEventListener("transitionend", onEnd);
            finishClose(item);
        }, 520);
        closeTimers.set(item, timer);
        function onEnd(event) {
            if (event.target !== panel || event.propertyName !== "opacity") return;
            cancelClose(item);
            panel.removeEventListener("transitionend", onEnd);
            finishClose(item);
        }
        panel.addEventListener("transitionend", onEnd);
    }

    function reveal(item) {
        var shelf = item.closest(".shelf") || item;
        shelf.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }

    function setOpen(item) {
        items.forEach(function (other) {
            var on = other === item;
            triggerOf(other).setAttribute("aria-expanded", on ? "true" : "false");
            var panel = panelOf(other);
            if (on) {
                cancelClose(other);
                panel.hidden = false;
                if (reduce) other.classList.add("is-open");
                else other.classList.remove("is-open");
            } else if (other.classList.contains("is-open") || !panel.hidden) {
                other.classList.remove("is-open");
                scheduleClose(other);
            }
        });
        document.body.dataset.open = item ? item.getAttribute("data-item") : "";
        openItem = item;
        if (!item) return;
        if (reduce) {
            reveal(item);
            return;
        }
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                if (openItem !== item) return;
                item.classList.add("is-open");
                reveal(item);
            });
        });
        // The shelf grows with the book. Scroll again once the page is tall enough to move.
        window.setTimeout(function () {
            if (openItem === item) reveal(item);
        }, 640);
    }

    items.forEach(function (item) {
        triggerOf(item).addEventListener("click", function () {
            var next = openItem === item ? null : item;
            var previous = openItem;
            setOpen(next);
            if (!next && previous) triggerOf(previous).focus();
        });

        panelOf(item).querySelector(".close").addEventListener("click", function () {
            setOpen(null);
            triggerOf(item).focus();
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape" || !openItem) return;
        var trigger = triggerOf(openItem);
        setOpen(null);
        trigger.focus();
    });

    document.addEventListener("click", function (event) {
        if (!openItem) return;
        if (event.target.closest("[data-item]")) return;
        var trigger = triggerOf(openItem);
        setOpen(null);
        trigger.focus();
    });
})();
