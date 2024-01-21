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
const recognitionId = localStorage.getItem("recognitionId");

$("#deleteButton").hide();

document.addEventListener('DOMContentLoaded', function () {
    showRecognition(recognitionId);

    $("#updateButton").on("click", async function () {        
        const result = await Swal.fire({
            title: 'Update this recognition',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Approve',
            cancelButtonText: 'Reject',
            cancelButtonColor: '#d33',
            showCloseButton: true,
            closeButtonHtml: '<span aria-hidden="true">&times;</span>', 
        });        
        
        if (result.isConfirmed) {            
            const dataInput = {
                statusId: 7
            };
            updateRecognition(recognitionId, dataInput);
        } else if (result.dismiss === Swal.DismissReason.cancel) {           
            const { value: text } = await Swal.fire({
                input: "textarea",
                inputLabel: "Reason",
                inputPlaceholder: "Type the reason for refusal here....",
                inputAttributes: {
                    "aria-label": "Type the reason for refusal here"
                },
                showCancelButton: true,
                preConfirm: (text) => {
                    if (!text) {
                        Swal.showValidationMessage('Please enter the reason for refusal');
                    }
                    return text;
                }
            });    
            if (text) {
                const dataInput = {
                    rejectionReason: text,
                    statusId: 8
                };
                updateRecognition(recognitionId, dataInput);
            }
        }
    });

    document.getElementById('deleteButton').addEventListener('click', function () {
        deleteRecognition(recognitionId);
    });
});

async function showRecognition(recognitionId) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Recognition.GET_BY_ID.replace("id", recognitionId), {
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
    document.getElementById("inputType").value = data.type ? 'Bonus' : 'Deduction';
    document.getElementById("inputAmount").value = formatMoney(data.amount);
    document.getElementById("inputReason").value = data.reason;
    document.getElementById("inputStatus").value = data.statusName;
    document.getElementById("inputRejectionReason").value = data.rejectionReason ? data.rejectionReason : '';

    showCreatedBy(data.createdBy);
    document.getElementById("inputCreatedDate").value = DateTime.fromFormat(data.createdDate, 'yyyy-MM-dd HH:mm:ss').toFormat('MM/dd/yyyy HH:mm:ss');
    document.getElementById("inputModifiedDate").value = data.statusId != 6 ?
        DateTime.fromFormat(data.date, 'yyyy-MM-dd HH:mm:ss').toFormat('MM/dd/yyyy HH:mm:ss') : '';
  
    if (data.statusId != 6) {
        $("#updateButton").hide();
    }

    if (data.createdBy == myId && data.statusId == 6) {
        $("#deleteButton").removeClass("d-none").show();
    }
}

async function showCreatedBy(userId) {
    try {      

        const response = await fetch(API.User.GET_BY_ID.replace("id", userId), {
            method: "GET",
            mode: 'cors',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById("inputCreatedBy").value = data.data.employeeCode + ' - ' + data.data.fullName;
        }
    } catch (error) {
        // Handle any network or server errors
        toastr.error("Error! Please try again later");
    }
}

async function updateRecognition(recognitionId, dataInput) {
    try {
        const response = await fetch(API.Recognition.UPDATE.replace("id", recognitionId), {
            method: "PATCH",
            mode: 'cors', // Bật chế độ CORS
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify(dataInput),
        });

        if (response.ok) {
            toastr.success("Update recognition successfully!");
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

function deleteRecognition(recognitionId) {
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

                const response = await fetch(API.Recognition.DELETE.replace("id", recognitionId), {
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
                        location.href = "../recognition.html";
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