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
const roleId = localStorage.getItem("roleId");
let dataTable;
showSelectDepartment();

document.addEventListener('DOMContentLoaded', function () {
  var currentDate = new Date();
  var year = currentDate.getFullYear();
  var month = currentDate.getMonth();
  if (month == 0) {
    year -= 1;
    month = 12;
  }
  $('#inputYear').val(year);
  $('#inputMonth').val(month);

  const inputDepartmentElement = document.getElementById('inputDepartment');
  var selectedDepartment = 0;
  showAllAttendance(selectedDepartment, year, month);  
  
  inputDepartmentElement.addEventListener('change', function () {
    selectedDepartment = this.value;
    showAllAttendance(selectedDepartment, year, month);
  });

  $('#inputYear').change(function () {
    year = $(this).val();
    showAllAttendance(selectedDepartment, year, month);
  });

  $('#inputMonth').change(function () {
    month = $(this).val();
    showAllAttendance(selectedDepartment, year, month);
  });

  // Create 
  $("#btnCreate").on("click", async function () {
    const { value: formValues } = await Swal.fire({
      title: "Create Attendance",
      html: `        
        <label class="col-form-label me-2">Year</label>
        <select class="swal2-input me-2" aria-label="Select year" style="width: auto;" id="swal-year" required>            
          <option value="2024">2024</option>    
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>                      
        </select>      

        <label class="col-form-label me-2">Month</label>
        <select class="swal2-input" aria-label="Select month" style="width: auto;" id="swal-month" required>          
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
          <option value="11">11</option>
          <option value="12">12</option>
        </select>      
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create",
      preConfirm: () => {
        return {
          year: document.getElementById("swal-year").value,
          month: document.getElementById("swal-month").value
        };
      }
    });
    if (formValues) {
      // Swal.fire(JSON.stringify(formValues));
      createAttendance(formValues);
    }
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

async function showAllAttendance(departmentId, year, month) {
  try {
    showLoadingOverlay();

    var param = `?year=${year}&month=${month}`;
    if (departmentId != 0) {
      param += `&departmentId=${departmentId}`;
    }
    const response = await fetch(API.Attendance.GET_ALL + param, {
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


function showData(data) {
  // Extract headings from the table
  const table = document.getElementById('table-attendance');
  const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
  var statusColors = ['text-success', 'text-danger', 'text-info', 'text-secondary', 'text-warning'];
  // Process data to match DataTable structure
  const processedData = data.map(item => [
    item.employeeCode,
    item.fullName,
    item.departmentName,
    item.month + '/' + item.year ,
    item.actualWorkingDays + '/' + item.workingDaysOfMonth,
    item.lateArrival,
    item.note ? item.note : '',
    `<button type="button" class="btn btn-info btn-sm text-white" title="View" data-attendance-id="${item.id}" onclick="viewOnClick(${item.id})">
        <i class="bi bi-eye"></i>
    </button>`
  ]);

  if (dataTable) {
    dataTable.destroy();
  }
  // Initialize DataTable
  dataTable = new simpleDatatables.DataTable('#table-attendance', {
    data: {
      headings: headings,
      data: processedData
    },
    perPage: 10,
    perPageSelect: [5, 10, 15, 25, ["All", -1]],
    searchable: true,
    sortable: true,
    classes: {
      active: "active",
      disabled: "disabled",
      selector: "form-select",
      paginationList: "pagination",
      paginationListItem: "page-item",
      paginationListItemLink: "page-link"
    },
    columns: [
      { select: 0, sortSequence: ["desc", "asc"], type: 'string'},
      { select: 1, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 2, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 3, sortSequence: ["desc", "asc"], type: 'date', format: 'YYYY/MM'},
      { select: 4, sortSequence: ["desc", "asc"], type: 'string', cellClass: "text-center" },
      { select: 5, sortSequence: ["desc", "asc"], type: 'string', cellClass: "text-center" },
      { select: 6, sortable: false, type: 'html' },
      { select: 7, sortable: false, type: 'html' },
    ],
    labels: {
      placeholder: "Search attendances...",
      searchTitle: "Search within table",
      pageTitle: "Page {page}",
      perPage: "attendances per page",
      noRows: "No attendances found",
      info: "Showing {start} to {end} of {rows} attendances",
      noResults: "No results match your search query",
    },
    template: options =>
      `<div class='${options.classes.top} fixed-table-toolbar row d-flex'>
        ${options.paging && options.perPageSelect ?
        `<div class='${options.classes.dropdown} bs-bars d-flex col-sm-4 align-items-center'>
              <div class="col-sm-1.5">
                <select class='${options.classes.selector}'></select>
              </div>
              <div class="col-sm-10.5">
                 <label class='p-1'>${options.labels.perPage}</label>
              </div>              
            </div>` : ""
      }
      ${options.searchable ?
        `<div class='${options.classes.search} search btn-group col-sm-8 me-auto'>
              <div class="col-sm-4 ms-auto">
                <input class='${options.classes.input} form-control search-input' placeholder='${options.labels.placeholder}' type='search' title='Search within table'>
              </div>
          </div>` : ""
      }
    </div>
    <div class='${options.classes.container}'${options.scrollY.length ? ` style='height: ${options.scrollY}; overflow-Y: auto;'` : ""}></div>
    <div class='${options.classes.bottom}'>
        ${options.paging ?
        `<div class='${options.classes.info}'></div>` :
        ""
      }
        <nav class='${options.classes.pagination}'></nav>
    </div>`,
  });
}

async function createAttendance(dataInput) {
  try {
      showLoadingOverlay();

      const response = await fetch(API.Attendance.CREATE, {
          method: "POST",
          mode: 'cors', // Bật chế độ CORS
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(dataInput),
      });

      if (response.ok) {
          toastr.success(`Create attendance for ${dataInput.month}-${dataInput.year} successfully`);
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