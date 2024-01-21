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
const employeeId = localStorage.getItem("employeeId");
let selectedPositionId = null;

document.addEventListener('DOMContentLoaded', function () {
    showEmployee(employeeId);

    document.getElementById('inputDepartment').addEventListener('change', function () {
        var departmentId = this.value;
        showSelectPosition(departmentId, selectedPositionId);
    });

    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        var inputFullName = document.getElementById("inputFullName").value;
        var inputGender = document.querySelector('input[name="inputGender"]:checked').value;
        var inputBirthday = document.getElementById("inputBirthday").value;
        var inputHometown = document.getElementById("inputHometown").value;
        var inputEthnicity = document.getElementById("inputEthnicity").value;
        var inputReligion = document.getElementById("inputReligion").value;
        var inputNationality = document.getElementById("inputNationality").value;
        var inputAddress = document.getElementById("inputAddress").value;

        var inputImage = null;
        var inputImageElement = document.getElementById('inputImage');
        if (inputImageElement.files.length > 0) {
            inputImage = inputImageElement.files[0];
        }

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
        if (inputImage) {
            formData.append("image", inputImage);
        }
        formData.append("idCardNumber", inputIdCardNumber);
        formData.append("idCardIssuedDate", inputIdCardIssuedDate);
        formData.append("idCardIssuedLocation", inputIdCardIssuedLocation);
        formData.append("phoneNumber", inputPhoneNumber);
        formData.append("email", inputEmail);
        formData.append("salary", inputSalary);
        formData.append("positionId", inputPosition);
        formData.append("statusId", inputStatus);

        updateEmployee(employeeId, formData);
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
    if (data.gender == true) {
        document.getElementById('genderRadios1').checked = true;
    } else {
        document.getElementById('genderRadios2').checked = true;
    }
    document.getElementById("inputBirthday").value = data.birthday;
    document.getElementById("inputHometown").value = data.hometown;
    document.getElementById("inputEthnicity").value = data.ethnicity;
    document.getElementById("inputReligion").value = data.religion;
    document.getElementById("inputNationality").value = data.nationality;
    document.getElementById("inputAddress").value = data.address;
    document.getElementById("inputOldImage").src = data.image;
    document.getElementById("imageLink").href = data.image;
    document.getElementById("inputIdCardNumber").value = data.idCardNumber;
    document.getElementById("inputIdCardIssuedDate").value = data.idCardIssuedDate;
    document.getElementById("inputIdCardIssuedLocation").value = data.idCardIssuedLocation;
    document.getElementById("inputPhoneNumber").value = data.phoneNumber;
    document.getElementById("inputEmail").value = data.email;
    document.getElementById("inputSalary").value = data.salary;
    showSelectDepartment(data.departmentId);
    showSelectPosition(data.departmentId, data.positionId);
    selectedPositionId = data.positionId;
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

async function showSelectPosition(departmentId, positionId) {
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
                if (item.id == positionId) {
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

async function updateEmployee(employeeId, formData) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Employee.UPDATE.replace("id", employeeId), {
            method: "PATCH",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (response.ok) {
            toastr.success("Update employee successfully!");
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