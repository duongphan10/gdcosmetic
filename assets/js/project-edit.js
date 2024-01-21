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
const projectId = localStorage.getItem("projectId");
let selectedProjectManagerId = null;

document.addEventListener('DOMContentLoaded', function () {
    showProject(projectId);

    document.getElementById('inputDepartment').addEventListener('change', function () {
        var departmentId = this.value;
        showSelectProjectManager(departmentId, selectedProjectManagerId);
    });

    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Lấy giá trị từ mỗi trường input
        var inputName = document.getElementById("inputName").value;
        var inputDescription = document.getElementById('inputDescription').value;
        var inputPurpose = document.getElementById('inputPurpose').value;
        var inputRequirement = document.getElementById("inputRequirement").value;
        var inputStakeholder = document.getElementById("inputStakeholder").value;
        var inputBudget = document.getElementById("inputBudget").value;
        var inputStartDate = document.getElementById("inputStartDate").value;
        var inputDueDate = document.getElementById("inputDueDate").value;
        var inputTimelineStart = document.getElementById("inputTimelineStart").value ? document.getElementById("inputTimelineStart").value : null;
        var inputTimelineEnd = document.getElementById("inputTimelineEnd").value ? document.getElementById("inputTimelineEnd").value : null;
        var inputNote = document.getElementById("inputNote").value;
        var inputEmployee = document.getElementById("inputEmployee").value;
        var inputStatus = document.getElementById("inputStatus").value;

        const dataInput = {
            name: inputName,
            description: inputDescription,
            purpose: inputPurpose,
            requirement: inputRequirement,
            stakeholder: inputStakeholder,
            budget: inputBudget,
            startDate: inputStartDate,
            dueDate: inputDueDate,
            timelineStart: inputTimelineStart,
            timelineEnd: inputTimelineEnd,
            note: inputNote,
            projectManagerId: inputEmployee,
            statusId: inputStatus
        };

        updateProject(projectId, dataInput);
    });
});

async function showProject(projectId) {
    try {
        const response = await fetch(API.Project.GET_BY_ID.replace("id", projectId), {
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
    // Get the input elements
    document.getElementById("inputName").value = data.name;
    document.getElementById("inputDescription").value = data.description;
    document.getElementById("inputPurpose").value = data.purpose;
    document.getElementById("inputRequirement").value = data.requirement;
    document.getElementById("inputStakeholder").value = data.stakeholder;
    document.getElementById("inputBudget").value = data.budget;

    document.getElementById("inputStartDate").value = data.startDate;
    document.getElementById("inputDueDate").value = data.dueDate;

    document.getElementById("inputTimelineStart").value = data.timelineStart;
    document.getElementById("inputTimelineEnd").value = data.timelineEnd;
    document.getElementById("inputNote").value = data.note;

    showSelectDepartment(data.projectManagerDepartmentId);
    showSelectProjectManager(data.projectManagerDepartmentId, data.projectManagerId);
    selectedProjectManagerId = data.projectManagerId;
    document.getElementById("inputStatus").value = data.statusId;
}

async function showSelectDepartment(departmentId) {
    try {
        const response = await fetch(API.Department.GET_ALL, {
            method: "GET",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            const selectElement = document.getElementById("inputDepartment");
            data.data.forEach(function (item) {
                var optionElement = document.createElement("option");
                optionElement.value = item.id;
                optionElement.text = item.name;
                if (item.id == departmentId) {
                    optionElement.selected = true;
                }
                selectElement.appendChild(optionElement);
            });
        } else {
            const errorResponse = await response.json();
            const errorMessage = errorResponse.message;
            toastr.error(errorMessage);
        }
    } catch (error) {
        // Handle any network or server errors
        toastr.error("Error! Please try again later");
    }
}

async function showSelectProjectManager(projectManagerDepartmentId, projectManagerId) {
    if (projectManagerDepartmentId != null) {
        try {
            const response = await fetch(`${API.Employee.GET_ALL_BY_ROLE}?departmentId=${projectManagerDepartmentId}&roleId=2`, {
                method: "GET",
                mode: 'cors',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                }
            });

            if (response.ok) {
                const data = await response.json();
                const selectElement = document.getElementById("inputEmployee");
                while (selectElement.firstChild) {
                    selectElement.removeChild(selectElement.firstChild);
                }
                // Thêm tùy chọn vào đối tượng select
                data.data.forEach(function (item) {
                    var optionElement = document.createElement("option");
                    optionElement.value = item.id;
                    optionElement.text = item.fullName;
                    if (item.id == projectManagerId) {
                        optionElement.selected = true;
                    }
                    selectElement.appendChild(optionElement);
                });
            } else {
                const errorResponse = await response.json();
                const errorMessage = errorResponse.message;
                toastr.error(errorMessage);
            }
        } catch (error) {
            // Handle any network or server errors
            toastr.error("Error! Please try again later");
        }
    }
}

async function updateProject(projectId, dataInput) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Project.UPDATE.replace("id", projectId), {
            method: "PATCH",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(dataInput),
        });

        if (response.ok) {
            toastr.success("Update project successfully");
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

function formatString(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Thêm khoảng trắng giữa chữ thường và chữ hoa
        .replace(/^./, match => match.toUpperCase()); // Chuyển đổi ký tự đầu thành chữ hoa
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