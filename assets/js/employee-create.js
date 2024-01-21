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
showSelectDepartment();

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('inputDepartment').addEventListener('change', function () {
        var selectedValue = this.value;
        showSelectPosition(selectedValue);
    });

    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Lấy giá trị từ mỗi trường input
        var inputFullName = document.getElementById("inputFullName").value;
        var inputGender = document.querySelector('input[name="inputGender"]:checked').value;
        var inputBirthday = document.getElementById("inputBirthday").value;
        var inputHometown = document.getElementById("inputHometown").value;
        var inputEthnicity = document.getElementById("inputEthnicity").value;
        var inputReligion = document.getElementById("inputReligion").value;
        var inputNationality = document.getElementById("inputNationality").value;
        var inputAddress = document.getElementById("inputAddress").value;
        var inputImage = document.getElementById("inputImage").files[0];
        var inputIdCardNumber = document.getElementById("inputIdCardNumber").value;
        var inputIdCardIssuedDate = document.getElementById("inputIdCardIssuedDate").value;
        var inputIdCardIssuedLocation = document.getElementById("inputIdCardIssuedLocation").value;
        var inputPhoneNumber = document.getElementById("inputPhoneNumber").value;
        var inputEmail = document.getElementById("inputEmail").value;
        var inputSalary = document.getElementById("inputSalary").value;
        var inputPosition = document.getElementById("inputPosition").value;
        var inputStatus = document.getElementById("inputStatus").value;

        // Tạo đối tượng FormData
        const formData = new FormData();
        formData.append("fullName", inputFullName);
        formData.append("gender", inputGender);
        formData.append("birthday", inputBirthday);
        formData.append("hometown", inputHometown);
        formData.append("ethnicity", inputEthnicity);
        formData.append("religion", inputReligion);
        formData.append("nationality", inputNationality);
        formData.append("address", inputAddress);
        formData.append("image", inputImage);
        formData.append("idCardNumber", inputIdCardNumber);
        formData.append("idCardIssuedDate", inputIdCardIssuedDate);
        formData.append("idCardIssuedLocation", inputIdCardIssuedLocation);
        formData.append("phoneNumber", inputPhoneNumber);
        formData.append("email", inputEmail);
        formData.append("salary", inputSalary);
        formData.append("positionId", inputPosition);
        formData.append("statusId", inputStatus);

        createEmployee(formData);
    });
});

async function showSelectDepartment() {
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

async function showSelectPosition(departmentId) {
    try {
        const response = await fetch(`${API.Position.GET_ALL}?departmentId=${departmentId}`, {
            method: "GET",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            const selectElement = document.getElementById("inputPosition");
            while (selectElement.firstChild) {
                selectElement.removeChild(selectElement.firstChild);
            }
            // Thêm tùy chọn vào đối tượng select
            data.data.forEach(function (item) {
                var optionElement = document.createElement("option");
                optionElement.value = item.id;
                optionElement.text = item.name;
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

async function createEmployee(formData) {
    try {
        showLoadingOverlay();
        
        const response = await fetch(API.Employee.CREATE, {
            method: "POST",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (response.ok) {
            toastr.success("Create employee successfully!");
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