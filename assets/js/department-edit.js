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
const departmentId = localStorage.getItem("departmentId");

document.addEventListener('DOMContentLoaded', function () {
    showDepartment(departmentId);
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        var inputName = document.getElementById("inputName").value;
        var inputDescription = document.getElementById("inputDescription").value;
        const dataInput = {
            name: inputName,
            description: inputDescription
        };

        updateDepartment(departmentId, dataInput);       
    });
});

async function showDepartment(departmentId) {
    try {
        const response = await fetch(API.Department.GET_BY_ID.replace("id", departmentId), {
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
    const idInput = document.querySelector('#inputId');
    const nameInput = document.querySelector('#inputName');
    const descriptionInput = document.querySelector('#inputDescription');
    const createdDateInput = document.querySelector('#inputCreatedDate');
    const lastModifiedDateInput = document.querySelector('#inputLastModifiedDate');

    // Set values to the input elements
    idInput.value = data.id;
    nameInput.value = data.name;
    descriptionInput.value = data.description;
    createdDateInput.value = data.createdDate; // You may need to format the date appropriately
    lastModifiedDateInput.value = data.lastModifiedDate;
}

async function updateDepartment(departmentId, dataInput) {
    try {
        const response = await fetch(API.Department.UPDATE.replace("id", departmentId), {
            method: "PATCH",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(dataInput),
        });

        if (response.ok) {
            toastr.success("Update department successfully!");
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