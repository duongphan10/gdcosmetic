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
  timeOut: '3000',             // Thời gian tự động ẩn thông báo (milliseconds)    
  extendedTimeOut: 0,
};

// Lấy accessToken từ localStorage
const accessToken = localStorage.getItem("accessToken");
const roleId = localStorage.getItem("roleId");
let dataTable;
showSelectDepartment();

document.addEventListener('DOMContentLoaded', function () {
  showAllPosition(0);

  document.getElementById('inputDepartment').addEventListener('change', function () {
    var selectedValue = this.value;
    showAllPosition(selectedValue);
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

async function showAllPosition(departmentId) {
  try {
    showLoadingOverlay();

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
      showData(data.data);
    } else {
      const errorResponse = await response.json();
      const errorMessage = errorResponse.message;     
      toastr.error(errorMessage);
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
  const table = document.getElementById('table-position');
  const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);

  // Process data to match DataTable structure
  const processedData = data.map(item => [
    // item.id,
    item.name,
    item.description,
    item.departmentName,
    // item.createdDate,
    // item.lastModifiedDate,
    `<button type="button" class="btn btn-info btn-sm text-white" title="View" data-position-id="${item.id}" onclick="viewOnClick(${item.id})">
        <i class="bi bi-eye"></i>
    </button>`
  ]);

  if (dataTable) {
    dataTable.destroy();
  }
  // Initialize DataTable
  dataTable = new simpleDatatables.DataTable('#table-position', {
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
      // { select: 0, sortSequence: ["desc", "asc"], type: 'number', cellClass: "fw-bold" },
      { select: 0, sortSequence: ["desc", "asc"], type: 'string' },
      { select: 1, sortable: false, type: 'string' },
      { select: 2, sortSequence: ["desc", "asc"], type: 'string' },
      // { select: 4, sortSequence: ["desc", "asc"], type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
      // { select: 5, sortSequence: ["desc", "asc"], type: 'date', format: 'YYYY-MM-DD HH:mm:ss' },
      { select: 3, sortable: false, type: 'html' },
    ],
    labels: {
      placeholder: "Search position...",
      searchTitle: "Search within table",
      pageTitle: "Page {page}",
      perPage: "positions per page",
      noRows: "No positions found",
      info: "Showing {start} to {end} of {rows} positions",
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

function showLoadingOverlay() {
  $.LoadingOverlay("show", {
    background: "rgba(255, 255, 255, 0.6)",
    imageAnimation: "3000ms rotate_right",
    image: "../assets/img/Spinner.png",
    imageColor: "black",
    maxSize: 100,
  });
}
