import API from './configAPI.js'

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

// Lấy accessToken từ localStorage
const accessToken = localStorage.getItem("accessToken");
const positionId = localStorage.getItem("positionId");

document.addEventListener('DOMContentLoaded', function () {
    showPosition(positionId);

    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        var inputName = document.querySelector("#inputName").value;
        var inputDescription = document.querySelector("#inputDescription").value;
        var departmentInput = document.querySelector('#inputDepartment').value;
        // console.log(departmentInput);
        const dataInput = {
            name: inputName,
            description: inputDescription,
            departmentId: departmentInput
        };

        updatePosition(positionId, dataInput);
    });
});

async function showPosition(positionId) {
    try {
        const response = await fetch(API.Position.GET_BY_ID.replace("id", positionId), {
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
    // const idInput = document.querySelector('#inputId');
    const nameInput = document.querySelector('#inputName');
    const descriptionInput = document.querySelector('#inputDescription');
    const departmentInput = document.querySelector('#inputDepartment');
    const createdDateInput = document.querySelector('#inputCreatedDate');
    const lastModifiedDateInput = document.querySelector('#inputLastModifiedDate');

    // Set values to the input elements
    // idInput.value = data.id;
    nameInput.value = data.name;
    descriptionInput.value = data.description;
    // showSelectDepartment(data.departmentId);
    departmentInput.value = data.departmentName;
    createdDateInput.value = data.createdDate;
    lastModifiedDateInput.value = data.lastModifiedDate;
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
            // Thêm tùy chọn vào đối tượng select
            data.data.forEach(function (item) {
                var optionElement = document.createElement("option");
                optionElement.value = item.id;
                optionElement.text = item.name;
                if (item.id === departmentId) {
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

async function updatePosition(positionId, dataInput) {
    try {
        const response = await fetch(API.Position.UPDATE.replace("id", positionId), {
            method: "PATCH",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(dataInput),
        });

        if (response.ok) {
            toastr.success("Update position successfully!");
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
    }
}

function formatString(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Thêm khoảng trắng giữa chữ thường và chữ hoa
        .replace(/^./, match => match.toUpperCase()); // Chuyển đổi ký tự đầu thành chữ hoa
}