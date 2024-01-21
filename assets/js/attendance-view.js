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
const attendanceId = localStorage.getItem("attendanceId");

document.addEventListener('DOMContentLoaded', function () {
    showAttendance(attendanceId);
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
    document.getElementById("inputActualWorkingDays").value = data.actualWorkingDays + '/' + data.workingDaysOfMonth;
    document.getElementById("inputLateArrival").value = data.lateArrival;
    document.getElementById("inputNote").value = data.note;
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
