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
const salaryId = localStorage.getItem("salaryId");

document.addEventListener('DOMContentLoaded', function () {
    showSalary(salaryId);

    document.getElementById('updateButton').addEventListener('click', function () {
        updateSalary(salaryId);
    });
});

async function showSalary(salaryId) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Salary.GET_BY_ID.replace("id", salaryId), {
            method: "GET",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            const response1 = await fetch(API.Attendance.GET_BY_ID.replace("id", data.data.attendanceId), {
                method: "GET",
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                }
            });
            if (response1.ok) {
                const data1 = await response1.json();
                showData(data.data, data1.data);
            }
        }
    } catch (error) {
        // Handle any network or server errors
        toastr.error("Error! Please try again later");
    } finally {
        $.LoadingOverlay("hide");
    }
}

function showData(data, data1) {
    // Get the input elements
    document.getElementById("inputEmployeeCode").value = data.employeeCode;
    document.getElementById("inputFullName").value = data.fullName;
    document.getElementById("inputDepartment").value = data.departmentName;
    document.getElementById("inputTime").value = data1.month + '/' + data1.year;
    document.getElementById("inputActualWorkingDays").value = data1.actualWorkingDays + '/' + data1.workingDaysOfMonth;
    document.getElementById("inputLateArrival").value = data1.lateArrival;

    document.getElementById("inputSalary").value = formatMoney(data.salary);
    document.getElementById("inputRealSalary").value = formatMoney(data.realSalary);
    document.getElementById("inputAllowance").value = formatMoney(data.allowance);
    document.getElementById("inputBonus").value = formatMoney(data.bonus);
    document.getElementById("inputDeduction").value = formatMoney(data.deduction);
    document.getElementById("inputInsurance").value = formatMoney(data.insurance);
    document.getElementById("inputTax").value = formatMoney(data.tax);
    document.getElementById("inputNetSalary").value = formatMoney(data.netSalary);
    document.getElementById("inputPaymentStatus").value = data.paymentStatus ? 'Paid' : 'Unpaid';
    document.getElementById("inputPaymentDate").value = data.paymentDate ? DateTime.fromISO(data.paymentDate).toFormat('MM/dd/yyyy HH:mm:ss') : '';
    // document.getElementById("inputPaymentDate").value = data.paymentDate;
}

function updateSalary(salaryId) {
    Swal.fire({
        title: 'Are you sure update?',
        // text: 'This action cannot be undone!',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
        customClass: {
            // popup: 'small-swal', // Thêm lớp CSS tùy chỉnh
        },
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                showLoadingOverlay();

                const response = await fetch(API.Salary.UPDATE.replace("id", salaryId), {
                    method: "PATCH",
                    mode: 'cors',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    toastr.success('Update salary successfully');
                    setTimeout(function () {
                        location.href = "../salary.html";
                    }, 1500);
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

function formatString(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Thêm khoảng trắng giữa chữ thường và chữ hoa
        .replace(/^./, match => match.toUpperCase()); // Chuyển đổi ký tự đầu thành chữ hoa
}