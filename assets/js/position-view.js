import API from './configAPI.js'

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

// Lấy accessToken từ localStorage
const accessToken = localStorage.getItem("accessToken");
const positionId = localStorage.getItem("positionId");

document.addEventListener('DOMContentLoaded', function () {
    showPosition(positionId);

    document.getElementById('deleteButton').addEventListener('click', function () {
        deletePosition(positionId);
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
    // const createdDateInput = document.querySelector('#inputCreatedDate');
    // const lastModifiedDateInput = document.querySelector('#inputLastModifiedDate');

    // Set values to the input elements
    // idInput.value = data.id;
    nameInput.value = data.name;
    descriptionInput.value = data.description;
    departmentInput.value = data.departmentName;
    // createdDateInput.value = data.createdDate;
    // lastModifiedDateInput.value = data.lastModifiedDate;
}

function deletePosition(positionId) {
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
                const response = await fetch(API.Position.DELETE.replace("id", positionId), {
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
                        location.href = "../position.html";
                    }, 1500);
                } else {
                    const errorResponse = await response.json();
                    toastr.error(errorResponse.message);
                }
            } catch (error) {
                // Handle any network or server errors
                toastr.error("Error! Please try again later");
            }
        }
    });

}