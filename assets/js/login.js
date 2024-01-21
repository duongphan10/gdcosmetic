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
        // Ngăn chặn hành động mặc định của form (chẳng hạn, trang sẽ không reload)
        event.preventDefault();

        // Lấy giá trị từ trường username và password
        var username = document.getElementById("yourUsername").value;
        var password = document.getElementById("yourPassword").value;

        if (username.trim() !== "" && password.trim() !== "") {
            // Gửi dữ liệu đăng nhập đến server (thực hiện tương ứng với yêu cầu của ứng dụng của bạn)
            try {
                const response = await fetch(API.Auth.LOGIN, {
                    method: "POST",
                    mode: 'cors', // Bật chế độ CORS
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, password }),
                });

                // Xử lý đăng nhập thành công
                if (response.ok) {
                    const data = await response.json();
                    const accessToken = data.data.accessToken;

                    // Save the access token in localStorage
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("roleId", data.data.roleId);
                    // Notification
                    // toastr.success("Signed in successfully");

                    // Redirect to the chat page after successful login                                          
                    location.href = "./index.html";

                } else {
                    // Handle login error
                    const errorResponse = await response.json();
                    const errorMessage = errorResponse.message;
                    toastr.error(errorMessage);
                }                

            } catch (error) {
                // Handle any network or server errors
                toastr.error("Error! Please try again later");
            }
        }
    });

});

