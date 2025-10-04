let isAuthenticated_ = null;
let isAdmin_ = false;

Object.defineProperty(this, 'isAuthenticated', {
    get: function () {
        return isAuthenticated_;
    },
    set: function (v) {
        isAuthenticated_ = v;

        if(v) {
            onSuccessfulLogin();
        } else {
            onSuccessfulLogout();
        }
    }
});

Object.defineProperty(this, 'isAdmin', {
    get: function () {
        return isAdmin_;
    },
    set: function (v) {
        isAdmin_ = v;

        if(v) {
            onAdminLogin();
        } else {
            onAdminLogout();
        }
    }
});

function openModal(modalID) {
    document.getElementById(modalID).classList.add("active");
}

function closeModal(modalID) {
    document.getElementById(modalID).classList.remove("active");
}

function logout(e) {
    if(e) {
        e.stopPropagation();
    }

    isAuthenticated = false;
    isAdmin = false;
}

document.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch("/api/session");
        if(response.status === 200) {
            isAuthenticated = true;

            const data = await response.json();
            isAdmin = data.isAdmin;
        }
    } catch (e) {
        logout();
    }

    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        try {
            const response = await fetch("/api/session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: document.getElementById("login-email").value,
                    password: document.getElementById("login-password").value,
                })
            });

            const data = await response.json();
            if(response.status === 200) {
                isAuthenticated = true;
                isAdmin = data.isAdmin;
                showPopover("Успешный вход");
                closeModal("login-modal");
            } else {
                showPopover(data.error);
            }
        } catch (error) {
            console.error(error);
            showPopover("Неизвестная ошибка при входе");
        }
    });

    document.querySelectorAll("[data-modal]").forEach(button => {
        const modalID = button.getAttribute("data-modal");
        const modal = document.getElementById(modalID);

        modal.addEventListener("click", function (e) {
            e.stopPropagation();
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        })

        button.addEventListener("click", () => {
            modal.classList.add("active");
        });
    });
});