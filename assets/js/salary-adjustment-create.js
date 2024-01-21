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

document.addEventListener('DOMContentLoaded', function () {
    showSelectDepartment();

    document.getElementById('inputDepartment').addEventListener('change', function () {
        var selectedValue = this.value;
        showSelectEmployee(selectedValue);
    });

    document.getElementById('inputEmployee').addEventListener('change', function () {
        var selectedValue = this.value;
        if (selectedValue !== 0) {
            showSalary(selectedValue);
        }
    });

    document.getElementById('inputNewSalary').addEventListener('input', function () {
        this.value = this.value.replace(/[^\d.]/g, '');
        var newSalary = this.value;        
        $(this).val(formatMoney(removeDotsFromMoney(newSalary)));
    });

    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();

        // Lấy giá trị từ mỗi trường input
        var inputNewSalary = $('#inputNewSalary').val();
        var inputReason = $('#inputReason').val();
        var inputEmployee = $('#inputEmployee').val();

        const dataInput = {
            newSalary: removeDotsFromMoney(inputNewSalary),
            reason: inputReason,
            employeeId: inputEmployee
        };

        createSalaryAdjustment(dataInput);
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

async function showSelectEmployee(departmentId) {
    try {
        const response = await fetch(`${API.Employee.GET_ALL}?departmentId=${departmentId}`, {
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
            while (selectElement.childElementCount > 1) {
                selectElement.removeChild(selectElement.firstChild);
            }
            // Thêm tùy chọn vào đối tượng select
            data.data.forEach(function (item) {
                var optionElement = document.createElement("option");
                optionElement.value = item.id;
                optionElement.text = item.fullName;
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

async function showSalary(employeeId) {
    try {
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
            $("#inputSalary").val(formatMoney(data.data.salary));
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

async function createSalaryAdjustment(dataInput) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.SalaryAdjustment.CREATE, {
            method: "POST",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(dataInput),
        });

        if (response.ok) {
            toastr.success("Create salary adjustment successfully");
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

function formatMoney(amount) {
    // Chuyển số thành chuỗi và đảo ngược chuỗi đó
    let str = String(amount).split("").reverse().join("");
    let formatted = "";
    for (let i = 0; i < str.length; i++) {
        formatted += str[i];
        if ((i + 1) % 3 === 0 && i !== str.length - 1) {
            formatted += ".";
        }
    }
    return formatted.split("").reverse().join("");
}

function removeDotsFromMoney(moneyString) {
    // Sử dụng phương thức replace để loại bỏ tất cả các dấu chấm
    return moneyString.replace(/\./g, "");
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