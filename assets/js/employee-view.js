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
const employeeId = localStorage.getItem("employeeId");

document.addEventListener('DOMContentLoaded', function () {
    showEmployee(employeeId);

    document.getElementById('deleteButton').addEventListener('click', function () {
        deleteEmployee(employeeId);
    });
});

async function showEmployee(employeeId) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Employee.GET_BY_ID.replace("id", employeeId), {
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
    } finally {
        $.LoadingOverlay("hide");
    }
}

function showData(data) {
    // Get the input elements
    document.getElementById("inputEmployeeCode").value = data.employeeCode;
    document.getElementById("inputFullName").value = data.fullName;
    document.getElementById("inputGender").value = data.gender ? "Male" : "Female";
    document.getElementById("inputBirthday").value = DateTime.fromISO(data.birthday).toFormat('MM/dd/yyyy');
    document.getElementById("inputHometown").value = data.hometown;
    document.getElementById("inputEthnicity").value = data.ethnicity;
    document.getElementById("inputReligion").value = data.religion;
    document.getElementById("inputNationality").value = data.nationality;
    document.getElementById("inputAddress").value = data.address;
    document.getElementById("inputImage").src = data.image;
    document.getElementById("imageLink").href = data.image;
    document.getElementById("inputIdCardNumber").value = data.idCardNumber;
    document.getElementById("inputIdCardIssuedDate").value = DateTime.fromISO(data.idCardIssuedDate).toFormat('MM/dd/yyyy');
    document.getElementById("inputIdCardIssuedLocation").value = data.idCardIssuedLocation;
    document.getElementById("inputPhoneNumber").value = data.phoneNumber;
    document.getElementById("inputEmail").value = data.email;
    document.getElementById("inputSalary").value = formatMoney(data.salary);
    document.getElementById("inputDepartment").value = data.departmentName;
    document.getElementById("inputPosition").value = data.positionName;
    document.getElementById("inputStatus").value = data.statusName;
}

function deleteEmployee(employeeId) {
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
                showLoadingOverlay();

                const response = await fetch(API.Employee.DELETE.replace("id", employeeId), {
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
                        location.href = "../employee.html";
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

function showLoadingOverlay() {
    $.LoadingOverlay("show", {
        background: "rgba(255, 255, 255, 0.6)",
        imageAnimation: "3000ms rotate_right",
        image: "../assets/img/Spinner.png",
        imageColor: "black",
        maxSize: 100,
    });
}

function formatMoney(amount) {
    // Chuyển số thành chuỗi và đảo ngược chuỗi đó
    let str = String(amount).split("").reverse().join("");

    let formatted = "";
    for (let i = 0; i < str.length; i++) {
        formatted += str[i];
        if ((i + 1) % 3 === 0 && i !== str.length - 1) { // Nếu là hàng nghìn và không phải là số cuối cùng
            formatted += ".";
        }
    }

    // Đảo ngược chuỗi đã được format để trở lại đúng thứ tự
    return formatted.split("").reverse().join("");
}