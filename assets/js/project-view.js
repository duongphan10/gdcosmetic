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
const projectId = localStorage.getItem("projectId");
let dataTable2;
var selectedStatus2 = 0;

document.addEventListener('DOMContentLoaded', function () {
    showProject(projectId);
    showAllTask(projectId, selectedStatus2);

    document.getElementById('deleteButton').addEventListener('click', function () {
        deleteProject(projectId);
    });
});

async function showProject(projectId) {
    try {
        showLoadingOverlay();

        const response = await fetch(API.Project.GET_BY_ID.replace("id", projectId), {
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
    document.getElementById("inputName").value = data.name;
    document.getElementById("inputDescription").value = data.description;
    document.getElementById("inputPurpose").value = data.purpose;
    document.getElementById("inputRequirement").value = data.requirement;
    document.getElementById("inputStakeholder").value = data.stakeholder;
    document.getElementById("inputBudget").value = data.budget;

    document.getElementById("inputStartDate").value = DateTime.fromISO(data.startDate).toFormat('MM/dd/yyyy');
    document.getElementById("inputDueDate").value = DateTime.fromISO(data.dueDate).toFormat('MM/dd/yyyy');

    document.getElementById("inputTimelineStart").value = data.timelineStart ? DateTime.fromISO(data.timelineStart).toFormat('MM/dd/yyyy') : "";
    document.getElementById("inputTimelineEnd").value = data.timelineEnd ? DateTime.fromISO(data.timelineEnd).toFormat('MM/dd/yyyy') : "";
    document.getElementById("inputNote").value = data.note;
    document.getElementById("inputDepartment").value = data.projectManagerDepartment;
    document.getElementById("inputEmployee").value = data.projectManagerFullName;
    document.getElementById("inputStatus").value = data.statusName;
}

function deleteProject(projectId) {
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

                const response = await fetch(API.Project.DELETE.replace("id", projectId), {
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
                        location.href = "../project.html";
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

async function showAllTask(projectId, statusId) {
    try {
        showLoadingOverlay();

        var param = statusId != 0 ? `?projectId=${projectId}&statusId=${statusId}&type=0` : `?projectId=${projectId}&type=0`;
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
    const table = document.getElementById('table-task');
    const headings = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
    var statusColors = ['text-secondary', 'text-primary', 'text-warning', 'text-success', 'text-danger'];

    // Process data to match DataTable structure
    const processedData = data.map(item => [
        item.name,
        item.requirement,
        DateTime.fromISO(item.startDate).toFormat('MM/dd/yyyy'),
        DateTime.fromISO(item.dueDate).toFormat('MM/dd/yyyy'),        
        item.employeeFullName != null ? item.employeeFullName : '',
        `<div class="${statusColors[item.statusId - 9]}"><b>${item.statusName}</b></div>`,
        `<button type="button" class="btn btn-info btn-sm text-white" title="View" data-employee-id="${item.id}" onclick="viewOnClick(${item.id})">
            <i class="bi bi-eye"></i>
      </button>`
    ]);

    if (dataTable2) {
        dataTable2.destroy();
    }
    // Initialize DataTable
    dataTable2 = new simpleDatatables.DataTable('#table-task', {
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
            { select: 1, sortSequence: ["desc", "asc"], type: 'string' },
            { select: 2, sortSequence: ["desc", "asc"], type: 'date' },
            { select: 3, sortSequence: ["desc", "asc"], type: 'date' },                     
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
        showAllTask(projectId, selectedStatus2);
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