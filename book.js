(function () {
    var book = document.querySelector("[data-book]");
    if (!book) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var section = document.querySelector(".reading");

    var rest = { x: 8, y: 28 };
    var opened = { x: 14, y: 40 };
    var current = { x: rest.x, y: rest.y };
    var pointer = { x: 0, y: 0 };

    function scrollBase() {
        if (!section) return rest;
        var rect = section.getBoundingClientRect();
        var vh = window.innerHeight || 1;
        var raw = 1 - rect.top / (vh * 0.7);
        var t = Math.min(1, Math.max(0, raw));
        var e = t * t * (3 - 2 * t);
        return {
            x: opened.x + (rest.x - opened.x) * e,
            y: opened.y + (rest.y - opened.y) * e
        };
    }

    if (fine) {
        window.addEventListener("pointermove", function (event) {
            if (event.pointerType && event.pointerType !== "mouse") return;
            var rect = book.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            var dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
            var dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
            pointer.y = Math.max(-8, Math.min(8, dx * 9));
            pointer.x = Math.max(-6, Math.min(6, -dy * 6));
        }, { passive: true });
    }

    function frame() {
        var base = scrollBase();
        var targetX = base.x + pointer.x;
        var targetY = base.y + pointer.y;
        current.x += (targetX - current.x) * 0.08;
        current.y += (targetY - current.y) * 0.08;
        book.style.setProperty("--rx", current.x.toFixed(2) + "deg");
        book.style.setProperty("--ry", current.y.toFixed(2) + "deg");
        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();
