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
let dataTable1;
let dataTable2;
var selectedStatus = 0;
var selectedStatus1 = 0;
var selectedStatus2 = 0;

if (roleId == 3) {
  $("#divCreate").hide();
}
else {
  $("#btnCreate").removeClass("d-none");
  $("#btnCreate").show();
}

document.addEventListener('DOMContentLoaded', function () { 
  showMyTask(0);
  showMyTaskCreated(0);
  showAllTask(0);
});


// --------------------- My Task ------------------------
async function showMyTask(statusId) {
  try {
    showLoadingOverlay();

    var param = statusId != 0 ? `?statusId=${statusId}` : '';   

    const response = await fetch(API.Task.GET_ALL_MY + param, {
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
  const table = document.getElementById('table-my-task');
  const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
  var statusColors = ['text-secondary', 'text-primary','text-warning', 'text-success', 'text-danger'];

  // Process data to match DataTable structure
  const processedData = data.map(item => [
    item.name,
    DateTime.fromISO(item.startDate).toFormat('MM/dd/yyyy'),
    DateTime.fromISO(item.dueDate).toFormat('MM/dd/yyyy'),
    item.projectName,
    item.projectManager,
    `<div class="${statusColors[item.statusId - 9]}"><b>${item.statusName}</b></div>`,
    `<button type="button" class="btn btn-info btn-sm text-white" title="View" data-task-id="${item.id}" onclick="viewOnClick(${item.id})">
          <i class="bi bi-eye"></i>
    </button>`
  ]);

  if (dataTable) {
    dataTable.destroy();
  }
  // Initialize DataTable
  dataTable = new simpleDatatables.DataTable('#table-my-task', {
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
      { select: 0, sortSequence: ["desc", "asc"], type: 'string', cellClass: "fw-bold" },      
      { select: 1, sortSequence: ["desc", "asc"], type: 'date' },
      { select: 2, sortSequence: ["desc", "asc"], type: 'date' },
      { select: 3, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 4, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 5, sortable: false, type: 'html' },
      { select: 6, sortable: false, type: 'html' },
    ],
    labels: {
      placeholder: "Search task...",
      searchTitle: "Search within table",
      pageTitle: "Page {page}",
      perPage: "tasks per page",
      noRows: "No tasks found",
      info: "Showing {start} to {end} of {rows} tasks",
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
            <div class="col-sm-4 me-auto">
              <select class="form-select" aria-label="Select status" id="inputStatus">
                <option selected disabled>Select status</option>
                <option value="0">All</option>
                <option value="9">New</option>
                <option value="10">Processing</option>
                <option value="11">Paused</option>
                <option value="12">Completed</option>
                <option value="13">Canceled</option>
              </select>
            </div>

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

  const inputStatusElement = document.getElementById('inputStatus');
  inputStatusElement.addEventListener('change', function () {
    selectedStatus = this.value;
    showMyTask(selectedStatus);
  });
  inputStatusElement.value = selectedStatus;
}


// --------------------- My Task Created ------------------------
async function showMyTaskCreated(statusId) {
  try {
    showLoadingOverlay();

    var param = statusId != 0 ? `?statusId=${statusId}&type=1` : '?type=1';   

    const response = await fetch(API.Task.GET_ALL + param, {
      method: "GET",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    if (response.ok) {
      const data = await response.json();
      showData1(data.data);
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


function showData1(data) {
  // Extract headings from the table
  const table = document.getElementById('table-created-task');
  const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
  var statusColors = ['text-secondary', 'text-primary','text-warning', 'text-success', 'text-danger'];

  // Process data to match DataTable structure
  const processedData = data.map(item => [
    item.name,
    DateTime.fromISO(item.startDate).toFormat('MM/dd/yyyy'),
    DateTime.fromISO(item.dueDate).toFormat('MM/dd/yyyy'),
    item.projectName,
    item.employeeFullName ? item.employeeFullName : '',
    `<div class="${statusColors[item.statusId - 9]}"><b>${item.statusName}</b></div>`,
    `<button type="button" class="btn btn-info btn-sm text-white" title="View" data-task-id="${item.id}" onclick="viewOnClick(${item.id})">
          <i class="bi bi-eye"></i>
    </button>`
  ]);

  if (dataTable1) {
    dataTable1.destroy();
  }
  // Initialize DataTable
  dataTable1 = new simpleDatatables.DataTable('#table-created-task', {
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
      { select: 0, sortSequence: ["desc", "asc"], type: 'string' },      
      { select: 1, sortSequence: ["desc", "asc"], type: 'date' },
      { select: 2, sortSequence: ["desc", "asc"], type: 'date' },
      { select: 3, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 4, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 5, sortable: false, type: 'html' },
      { select: 6, sortable: false, type: 'html' },
    ],
    labels: {
      placeholder: "Search task...",
      searchTitle: "Search within table",
      pageTitle: "Page {page}",
      perPage: "tasks per page",
      noRows: "No tasks found",
      info: "Showing {start} to {end} of {rows} tasks",
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
            <div class="col-sm-4 me-auto">
              <select class="form-select" aria-label="Select status" id="inputStatus1">
                <option selected disabled>Select status</option>
                <option value="0">All</option>
                <option value="9">New</option>
                <option value="10">Processing</option>
                <option value="11">Paused</option>
                <option value="12">Completed</option>
                <option value="13">Canceled</option>
              </select>
            </div>

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

  const inputStatusElement = document.getElementById('inputStatus1');
  inputStatusElement.addEventListener('change', function () {
    selectedStatus1 = this.value;
    showMyTaskCreated(selectedStatus1);
  });
  inputStatusElement.value = selectedStatus1;
}

// --------------------- All Task ------------------------
async function showAllTask(statusId) {
  try {
    showLoadingOverlay();

    var param = statusId != 0 ? `?statusId=${statusId}&type=0` : '?type=0';
    const response = await fetch(API.Task.GET_ALL + param, {
      method: "GET",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    if (response.ok) {
      const data = await response.json();
      showData2(data.data);
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


function showData2(data) {
  // Extract headings from the table
  const table = document.getElementById('table-all-task');
  const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
  var statusColors = ['text-secondary', 'text-primary','text-warning', 'text-success', 'text-danger'];

  // Process data to match DataTable structure
  const processedData = data.map(item => [
    item.name,
    DateTime.fromISO(item.startDate).toFormat('MM/dd/yyyy'),
    DateTime.fromISO(item.dueDate).toFormat('MM/dd/yyyy'),
    item.projectName,
    item.projectManager,
    item.employeeFullName != null ? item.employeeFullName : '',
    `<div class="${statusColors[item.statusId - 9]}"><b>${item.statusName}</b></div>`,
    `<button type="button" class="btn btn-info btn-sm text-white" title="View" data-task-id="${item.id}" onclick="viewOnClick(${item.id})">
          <i class="bi bi-eye"></i>
    </button>`
  ]);

  if (dataTable2) {
    dataTable2.destroy();
  }
  // Initialize DataTable
  dataTable2 = new simpleDatatables.DataTable('#table-all-task', {
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
      { select: 0, sortSequence: ["desc", "asc"], type: 'string' },      
      { select: 1, sortSequence: ["desc", "asc"], type: 'date' },
      { select: 2, sortSequence: ["desc", "asc"], type: 'date' },
      { select: 3, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 4, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 5, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 6, sortable: false, type: 'html' },
      { select: 7, sortable: false, type: 'html' },
    ],
    labels: {
      placeholder: "Search task...",
      searchTitle: "Search within table",
      pageTitle: "Page {page}",
      perPage: "tasks per page",
      noRows: "No tasks found",
      info: "Showing {start} to {end} of {rows} tasks",
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
        `<div class='${options.classes.search} search btn-group col-sm-8 me-auto '>
            <div class="col-sm-4">
              <select class="form-select" aria-label="Select status" id="inputStatus2">
                <option selected disabled>Select status</option>
                <option value="0">All</option>
                <option value="9">New</option>
                <option value="10">Processing</option>
                <option value="11">Paused</option>
                <option value="12">Completed</option>
                <option value="13">Canceled</option>
              </select>
            </div>

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

  const inputStatusElement = document.getElementById('inputStatus2');
  inputStatusElement.addEventListener('change', function () {
    selectedStatus2 = this.value;
    showAllTask(selectedStatus2);
  });
  inputStatusElement.value = selectedStatus2;
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