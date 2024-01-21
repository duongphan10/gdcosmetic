import API from './configAPI.js'
const { DateTime } = luxon;

toastr.options = {
    progressBar: false,
    newestOnTop: true,           // Hiển thị thông báo mới nhất ở trên cùng
    preventDuplicates: false,
    onclick: null,
    positionClass: 'toast-top-center',
    toastClass: 'toastr-custom-width',
    showEasing: 'swing',         // Hiệu ứng hiển thị
    hideEasing: 'linear',        // Hiệu ứng ẩn
    showMethod: 'fadeIn',        // Phương thức hiển thị
    hideMethod: 'fadeOut',        // Phương thức ẩn      
    timeOut: '3000',             // Thời gian tự động ẩn thông báo (milliseconds)           
    extendedTimeOut: 0,
};

Fancybox.bind("[data-fancybox]", {
    // Your custom options
});

// Lấy accessToken từ localStorage
const accessToken = localStorage.getItem("accessToken");
const attendanceId = localStorage.getItem("attendanceId");

document.addEventListener('DOMContentLoaded', function () {
    showAttendance(attendanceId);
  
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        var inputActualWorkingDays = document.getElementById("inputActualWorkingDays").value;
        var inputLateArrival = document.getElementById("inputLateArrival").value;
        var inputNote = document.getElementById("inputNote").value;

        const dataInput = {
            actualWorkingDays: inputActualWorkingDays,
            rollateArrivaleId: inputLateArrival,
            note: inputNote
        };

        updateAttendance(attendanceId, dataInput);
    });
});

async function showAttendance(attendanceId) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Attendance.GET_BY_ID.replace("id", attendanceId), {
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
    document.getElementById("inputDepartment").value = data.departmentName;
    document.getElementById("inputTime").value = data.month + '/' + data.year;
    document.getElementById("inputWorkingDaysOfMonth").value = data.workingDaysOfMonth;
    document.getElementById("inputActualWorkingDays").value = data.actualWorkingDays;
    document.getElementById("inputLateArrival").value = data.lateArrival;
    document.getElementById("inputNote").value = data.note;
}

async function updateAttendance(attendanceId, dataInput) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Attendance.UPDATE.replace("id", attendanceId), {
            method: "PATCH",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(dataInput),
        });

        if (response.ok) {
            toastr.success("Update attendance successfully");
            setTimeout(function () {
                location.href = "./view.html";
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