import API from './configAPI.js'

toastr.options = {
    progressBar: false,
    newestOnTop: true,           // Hiển thị thông báo mới nhất ở trên cùng
    preventDuplicates: true,
    positionClass: 'toast-top-center',
    toastClass: 'toastr-custom-width',
    showEasing: 'swing',         // Hiệu ứng hiển thị
    hideEasing: 'linear',        // Hiệu ứng ẩn
    showMethod: 'fadeIn',        // Phương thức hiển thị
    hideMethod: 'fadeOut',        // Phương thức ẩn      
    timeOut: '2000',             // Thời gian tự động ẩn thông báo (milliseconds)            
};

document.addEventListener("DOMContentLoaded", function () {
    // Bắt sự kiện submit form
    document.querySelector("form").addEventListener("submit", async function (event) {
        event.preventDefault();

        var password = $("#newPassword").val();
        var confimPassword = $("#confimPassword").val();

        if (password != confimPassword) {
            toastr.error("Confirmation password does not match!");
        } else {
            try {
                showLoadingOverlay();
                const token = localStorage.getItem("token");
                console.log(token);
                const response = await fetch(API.User.CREATE_NEW_PASSWORD, {
                    method: "PATCH",
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ password }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.data.status == true) {
                        toastr.success(data.data.message);
                        setTimeout(function () {
                            location.href = "./login.html";
                        }, 1500);
                    }
                    else {
                        toastr.error(data.data.message);
                    }

                } else {
                    const errorResponse = await response.json();
                    const errorMessage = errorResponse.message;
                    let errorMessageString = "";
                    if (typeof errorMessage === 'string') {
                        errorMessageString = errorMessage;
                    }
                    else {
                        const errorFields = Object.keys(errorMessage);
                        errorFields.forEach(field => {
                            errorMessageString = `${formatString(field)}: ${errorMessage[field]}`;
                        });
                    }

                    toastr.error(errorMessageString);
                }

            } catch (error) {
                // Handle any network or server errors
                toastr.error("Error! Please try again later");
            } finally {
                $.LoadingOverlay("hide");
            }
        }

    });

});

function showLoadingOverlay() {
    $.LoadingOverlay("show", {
        background: "rgba(255, 255, 255, 0.6)",
        imageAnimation: "3000ms rotate_right",
        image: "../assets/img/Spinner.png",
        imageColor: "black",
        maxSize: 100,
    });
}

function formatString(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Thêm khoảng trắng giữa chữ thường và chữ hoa
        .replace(/^./, match => match.toUpperCase()); // Chuyển đổi ký tự đầu thành chữ hoa
}