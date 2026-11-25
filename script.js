
"use strict";

/* =====================================
   FLEXGAMES - DOM ELEMENTS
===================================== */

const loader = document.getElementById("loader");
const gameCards = document.querySelectorAll(".game-card");
const selectedGame = document.getElementById("selectedGame");
const orderForm = document.getElementById("orderForm");
const productSelect = document.getElementById("product");
const paymentSelect = document.getElementById("payment");
const totalPrice = document.getElementById("totalPrice");
const toastContainer = document.getElementById("toastContainer");
const gameSearch = document.getElementById("gameSearch");
const paymentPanel = document.getElementById("paymentPanel");
const paymentAmount = document.getElementById("paymentAmount");

gameCards.forEach(card => {
    const image = card.querySelector("img");
    const name = card.querySelector("h3").textContent;
    const fallback = card.querySelector(".game-fallback");

    card.title = name;

    const showFallback = () => {
        image.classList.add("is-broken");
        image.classList.remove("is-ready");
        fallback.hidden = false;
    };

    const showImage = () => {
        image.classList.remove("is-broken");
        image.classList.add("is-ready");
        fallback.hidden = true;
    };

    image.addEventListener("load", showImage);
    image.addEventListener("error", showFallback);

    if (image.complete) {
        image.naturalWidth > 0 ? showImage() : showFallback();
    }
});

const heroArtwork = document.querySelector(".console-glow");
const heroConsole = heroArtwork?.closest(".hero-console");

if (heroArtwork && heroConsole) {
    const showHeroLogo = () => {
        heroArtwork.classList.remove("is-broken");
        heroConsole.classList.add("has-logo");
    };

    const showHeroFallback = () => {
        heroArtwork.classList.add("is-broken");
        heroConsole.classList.remove("has-logo");
    };

    heroArtwork.addEventListener("load", showHeroLogo);
    heroArtwork.addEventListener("error", showHeroFallback);

    if (heroArtwork.complete) {
        heroArtwork.naturalWidth > 0 ? showHeroLogo() : showHeroFallback();
    }
}

const parallaxElements = [
    ...document.querySelectorAll(
        ".hero-console, .console-mark, .console-glow, .orbit-one, .orbit-two, .badge-top, .badge-bottom, .game-card img"
    )
].map(element => ({
    element,
    strength: element.matches(".console-mark, .console-glow") ? 14
        : element.matches(".hero-console") ? 7
            : element.matches(".orbit-one, .orbit-two") ? 11
                : element.matches(".badge-top, .badge-bottom") ? 13
                    : 6
}));

let parallaxFrame = null;

const updateParallax = () => {
    const viewportHeight = window.innerHeight || 1;
    const offsets = parallaxElements.map(({ element, strength }) => {
        if (element.closest("[hidden]")) return null;
        const rect = element.getBoundingClientRect();
        const previousOffset = Number.parseFloat(
            element.style.getPropertyValue("--parallax-y")
        ) || 0;
        const baseTop = rect.top - previousOffset;
        const baseBottom = baseTop + rect.height;

        if (!rect.height || baseBottom < 0 || baseTop > viewportHeight) {
            return { element, value: 0 };
        }

        const distanceFromCenter =
            (baseTop + rect.height / 2 - viewportHeight / 2) / viewportHeight;
        const offset = Math.max(-7, Math.min(7, -distanceFromCenter * strength));

        return { element, value: offset };
    });

    offsets.forEach(update => {
        if (update) {
            update.element.style.setProperty("--parallax-y", `${update.value.toFixed(2)}px`);
        }
    });

    parallaxFrame = null;
};

const requestParallaxUpdate = () => {
    if (!parallaxFrame) {
        parallaxFrame = requestAnimationFrame(updateParallax);
    }
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
    window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
    window.addEventListener("resize", requestParallaxUpdate);
    requestParallaxUpdate();
}

if (
    !prefersReducedMotion &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
) {
    gameCards.forEach(card => {
        card.addEventListener("pointermove", event => {
            const rect = card.getBoundingClientRect();
            const previousX = Number.parseFloat(
                card.style.getPropertyValue("--cursor-x")
            ) || 0;
            const previousY = Number.parseFloat(
                card.style.getPropertyValue("--cursor-y")
            ) || 0;
            const baseLeft = rect.left - previousX;
            const baseTop = rect.top - previousY + 4;
            const relativeX = event.clientX - (baseLeft + rect.width / 2);
            const relativeY = event.clientY - (baseTop + rect.height / 2);
            const offsetX = Math.max(-6, Math.min(6, relativeX * 0.04));
            const offsetY = Math.max(-6, Math.min(6, relativeY * 0.04));

            card.style.setProperty("--cursor-x", `${offsetX.toFixed(2)}px`);
            card.style.setProperty("--cursor-y", `${offsetY.toFixed(2)}px`);
        });

        card.addEventListener("pointerleave", () => {
            card.style.setProperty("--cursor-x", "0px");
            card.style.setProperty("--cursor-y", "0px");
        });
    });
}

/* =====================================
   LOADING SCREEN
===================================== */

window.addEventListener("load", () => {
    setTimeout(() => {
        loader.classList.add("hidden");
    }, 800);
});

/* =====================================
   TOAST NOTIFICATION
===================================== */

function showToast(message, type = "success") {
    const toast = document.createElement("div");

    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

/* =====================================
   GAME SELECTION
===================================== */

function selectGame(card) {
    const gameName = card.dataset.game;

    if (!gameName) return;

    const formattedName = gameName
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    selectedGame.value = formattedName;

    document.getElementById("order").scrollIntoView({
        behavior: "smooth"
    });

    showToast(`${formattedName} berhasil dipilih!`);
}

gameCards.forEach(card => {
    card.addEventListener("click", () => {
        gameCards.forEach(item => item.classList.remove("selected"));
        card.classList.add("selected");
        selectGame(card);
    });

    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            gameCards.forEach(item => item.classList.remove("selected"));
            card.classList.add("selected");
            selectGame(card);
        }
    });
});

gameSearch.addEventListener("input", () => {
    const query = gameSearch.value.trim().toLowerCase();

    gameCards.forEach(card => {
        const name = card.dataset.game.replaceAll("-", " ");
        card.hidden = !name.includes(query);
    });
});

/* =====================================
   PRICE FORMAT
===================================== */

function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}

productSelect.addEventListener("change", () => {
    const price = Number(productSelect.value) || 0;

    totalPrice.textContent = formatRupiah(price);
    paymentPanel.hidden = true;
});

paymentSelect.addEventListener("change", () => {
    paymentPanel.hidden = true;
});

/* =====================================
   ORDER VALIDATION
===================================== */

orderForm.addEventListener("submit", event => {
    event.preventDefault();

    const game = selectedGame.value.trim();
    const playerId = document.getElementById("playerId").value.trim();
    const product = Number(productSelect.value);
    const payment = paymentSelect.value;

    if (!game) {
        showToast("Silakan pilih game terlebih dahulu.", "error");
        return;
    }

    if (!playerId) {
        showToast("User ID harus diisi.", "error");
        return;
    }

    if (!product || !payment) {
        showToast("Lengkapi nominal dan pembayaran.", "error");
        return;
    }

    if (payment !== "QRIS") {
        paymentPanel.hidden = true;
        showToast("Pembayaran Transfer Bank dan DANA belum tersedia. Silakan pilih QRIS.", "error");
        return;
    }

    // This frontend creates an order summary only.
    // A trusted backend must create and verify real payments.

    const order = {
        game,
        playerId,
        amount: product,
        payment,
        status: "PENDING"
    };

    console.log("New order:", order);

    paymentAmount.textContent = formatRupiah(product);
    paymentPanel.hidden = false;
    paymentPanel.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center"
    });

    showToast("Kode QR pembayaran ditampilkan. Pembayaran belum diverifikasi otomatis.", "success");
});
