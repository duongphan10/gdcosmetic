import API from './configAPI.js'
const { DateTime } = luxon;

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

Fancybox.bind("[data-fancybox]", {
    // Your custom options
});

// Lấy accessToken từ localStorage
const accessToken = localStorage.getItem("accessToken");
const userId = localStorage.getItem("userId");

document.addEventListener('DOMContentLoaded', function () {
    showAccount(userId);

    document.getElementById('deleteButton').addEventListener('click', function () {
        deleteUser(userId);
     });
});

async function showAccount(userId) {
    try {
        const response = await fetch(API.User.DELETE.replace("id", userId), {
            method: "GET",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            showData(data.data);
        }
    } catch (error) {
        // Handle any network or server errors
        toastr.error("Error! Please try again later");
    }
}

function showData(data) {
    var roleNames = ['LEADER', 'MANAGER', 'EMPLOYEE'];
    // Get the input elements
    document.getElementById("inputUsername").value = data.username;
    document.getElementById("inputEmployeeCode").value = data.employeeCode;
    document.getElementById("inputFullName").value = data.fullName;
    // document.getElementById("inputGender").value = data.gender ? "Male" : "Female";
    // document.getElementById("inputBirthday").value = DateTime.fromISO(data.birthday).toFormat('MM/dd/yyyy');
    document.getElementById("inputEmail").value = data.email;
    document.getElementById("inputDepartment").value = data.departmentName;
    document.getElementById("inputPosition").value = data.positionName;
    document.getElementById("inputEmployeeStatus").value = data.employeeStatusName;
    document.getElementById("inputRole").value = roleNames[data.roleId-1];
    document.getElementById("inputStatus").value = data.enabled ? 'Enable' : 'Disable';
}

function deleteUser(userId) {
    Swal.fire({
        title: 'Are you sure delete?',
        // text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        customClass: {
            // popup: 'small-swal', // Thêm lớp CSS tùy chỉnh
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                $.LoadingOverlay("show", {
                    background: "rgba(255, 255, 255, 0.6)",
                    imageAnimation: "3000ms rotate_right",
                    image: "../assets/img/Spinner.png",
                    imageColor: "black",
                    maxSize: 100,
                });

                const response = await fetch(API.User.GET_BY_ID.replace("id", userId), {
                    method: "DELETE",
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    toastr.success(data.data.message);
                    setTimeout(function () {
                        location.href = "../account.html";
                    }, 1500);
                } else {
                    const errorResponse = await response.json();
                    toastr.error(errorResponse.message);
                }
            } catch (error) {
                // Handle any network or server errors
                toastr.error("Error! Please try again later");
            } finally {
                $.LoadingOverlay("hide");
            }
        }
    });

}