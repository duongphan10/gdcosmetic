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
  timeOut: '3000',             // Thời gian tự động ẩn thông báo (milliseconds)    
  extendedTimeOut: 0,
};

Fancybox.bind("[data-fancybox]", {
  // Your custom options
});

// Lấy accessToken từ localStorage
const accessToken = localStorage.getItem("accessToken");

document.addEventListener('DOMContentLoaded', function () {
  showProfile();

  $('#formChangePassword').submit(function (event) {
    event.preventDefault();

    let currentPassword = $('#currentPassword').val();
    let newPassword = $('#newPassword').val();
    let renewPassword = $('#renewPassword').val();

    if (newPassword !== renewPassword) {
      toastr.error('The new password and the re-entered password do not match!');
      return; // Dừng hàm xử lý nếu mật khẩu không khớp
    }
    const dataInput = {
      currentPassword: currentPassword,
      newPassword: newPassword
    };
    changePassword(dataInput);
  });
});

async function showProfile() {
  try {
    const response = await fetch(API.User.GET_CURRENT_USER, {
      method: "GET",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    if (response.ok) {
      const data = await response.json();

      // Show Profile
      if (data.data.avatar) {
        $('#profile-avatar-link').attr('href', data.data.avatar);
        $('#profile-avatar').attr('src', data.data.avatar);
      }
      $('#profile-full-name').text(data.data.fullName);
      if (data.data.positionName) {
        $('#profile-position').text(data.data.positionName);
      }

      showDetailProfile(data.data);
      showEditProfile(data.data);

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

function showDetailProfile(data) {
  $('#overview-full-name').text(data.fullName);
  $('#overview-gender').text(data.gender ? 'Male' : 'Female');
  $('#overview-birthday').text(DateTime.fromISO(data.birthday).toFormat('MM/dd/yyyy'));
  // $('#overview-department').text(data.departmentName);
  $('#overview-position').text(data.positionName);
  $('#overview-country').text(data.country);
  $('#overview-address').text(data.address);
  $('#overview-phone').text(data.phone);
  $('#overview-email').text(data.email);
}

function showEditProfile(data) {
  const oldImageUrl = $('#avatar-edit').attr('src');

  if (data.avatar) {
    $('#avatar-edit-link').attr('href', data.avatar);
    $('#avatar-edit').attr('src', data.avatar);
  }

  document.getElementById('uploadBtn').addEventListener('click', function () {
    $('#fileInput').click();
  });

  document.getElementById('removeBtn').addEventListener('click', function () {
    $('#avatar-edit-link').attr('href', oldImageUrl);
    $('#avatar-edit').attr('src', oldImageUrl);
    $('#fileInput').val(null);
  });

  document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      $('#avatar-edit-link').attr('href', imageUrl);
      $('#avatar-edit').attr('src', imageUrl);
    }
  });

  document.getElementById('formProfileEdit').addEventListener('submit', async function (event) {
    event.preventDefault();
    var imgUrl = $('#avatar-edit').attr('src');
    const file = $('#fileInput')[0].files[0];
    const formData = new FormData();
    if (file) {
      formData.append('avatar', file);
    }
    else {
      // Sử dụng Fetch API để lấy dữ liệu từ URL
      const response = await fetch(oldImageUrl);
      // Kiểm tra nếu phản hồi không thành công
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Chuyển đổi dữ liệu từ response thành Blob
      const blob = await response.blob();
      formData.append('avatar', blob);
    }
    changeAvatar(formData);
  });

}

async function changeAvatar(formData) {
  try {
    showLoadingOverlay();
    const response = await fetch(API.User.CHANGE_AVATAR, {
      method: "PATCH",
      mode: 'cors',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      toastr.success("Change avatar successful");
      setTimeout(function () {
        window.location.reload();
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

async function changePassword(dataInput) {
  try {
    showLoadingOverlay();
    const response = await fetch(API.User.CHANGE_PASSWORD, {
      method: "PATCH",
      mode: 'cors',
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataInput),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.data.status == true) {
        toastr.success(data.data.message);
      }
      else {
        toastr.error(data.data.message);
      }
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
