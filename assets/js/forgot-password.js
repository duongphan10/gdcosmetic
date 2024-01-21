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

        var email = document.getElementById("yourEmail").value;
        try {
            showLoadingOverlay();

            const response = await fetch(API.Auth.SEND_VERIFY, {
                method: "POST",
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                const data = await response.json();
                toastr.success(data.data.message);

                var emailInput = $('#yourEmail');
                emailInput.prop('readonly', true);
                emailInput.addClass('bg-body-secondary');

                $('#div-verify').show();
                $('#verificationCode').prop('required', true);
                $('#div-send').hide();
                $('#div-confirm').show();

                $('#btn-confirm').click(async function() {            

                    var verificationCode = $("#verificationCode").val();
                    try {
                        showLoadingOverlay();

                        const response1 = await fetch(API.Auth.VERIFY, {
                            method: "POST",
                            mode: 'cors',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ email, verificationCode }),
                        });

                        if (response1.ok) {
                            const data1 = await response1.json();
                            if (data1.data.status == true) {
                                localStorage.setItem("token", data1.data.message);
                                location.href = "./create-password.html";                                
                            }
                            else {
                                toastr.error(data1.data.message);
                            }
                        } else {
                            const errorResponse = await response1.json();
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

                });

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