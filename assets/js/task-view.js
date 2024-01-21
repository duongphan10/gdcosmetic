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
const roleId = localStorage.getItem("roleId");
const myId = localStorage.getItem("myId");
const taskId = localStorage.getItem("taskId");

if (roleId == 2) {
    $("#updateButton").removeClass("d-none").show();
    $("#deleteButton").removeClass("d-none").show();
}

document.addEventListener('DOMContentLoaded', function () {
    showTask(taskId);

    document.getElementById('deleteButton').addEventListener('click', function () {
        deleteTask(taskId);
    });
});

async function showTask(taskId) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Task.GET_BY_ID.replace("id", taskId), {
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
    document.getElementById("inputName").value = data.name;
    document.getElementById("inputDescription").value = data.description;
    document.getElementById("inputRequirement").value = data.requirement;
    document.getElementById("inputBudget").value = data.budget;

    document.getElementById("inputStartDate").value = DateTime.fromISO(data.startDate).toFormat('MM/dd/yyyy');
    document.getElementById("inputDueDate").value = DateTime.fromISO(data.dueDate).toFormat('MM/dd/yyyy');

    document.getElementById("inputActualStart").value = data.actualStartDate ? DateTime.fromISO(data.actualStartDate).toFormat('MM/dd/yyyy') : "";
    document.getElementById("inputActualEnd").value = data.actualEndDate ? DateTime.fromISO(data.actualEndDate).toFormat('MM/dd/yyyy') : "";
    document.getElementById("inputNote").value = data.note;

    document.getElementById("inputProjectName").value = data.projectName;
    document.getElementById("inputProjectManager").value = data.projectManager;
    document.getElementById("inputEmployee").value = data.employeeFullName;
    document.getElementById("inputStatus").value = data.statusName;

    if (data.createdBy != myId) {
        $("#updateButton").hide();
        $("#deleteButton").hide();
    }
}

function deleteTask(taskId) {
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

                const response = await fetch(API.Task.DELETE.replace("id", taskId), {
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
                        location.href = "../project.html";
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