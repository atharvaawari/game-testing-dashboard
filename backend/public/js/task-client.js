
function toggleBody(emailId) {
  const body = document.getElementById('body' + emailId);
  body.classList.toggle('show');
};

function submitWeeklyTargets(targetsCategory) {

  let targetTitle = document.querySelector(`#${targetsCategory}-target-title`);
  let targetDesc = document.querySelector(`#${targetsCategory}-target-desc`);
  let week = document.querySelector(`#currentWeek`);
  let currentMonth = document.querySelector(`#currentMonth`);
  let priority = document.querySelector(`#${targetsCategory}-set-priority`);
  priority = priority.options[priority.selectedIndex].value;

  if (targetTitle.value !== '' && targetDesc.value !== '' && priority.value !== '') {
    apiReq('add-wekkly-target', [{
      task_owner: targetTitle.value,
      task_details: targetDesc.value,
      category: '<%=parentCategory%>',
      week: week.value,
      targets_category: targetsCategory,
      current_month: currentMonth.value,
      priority: priority
    }])
  } else {
    // document.querySelector('#body-add-' + targetsCategory ).style.display = 'none'
    document.querySelector('#body-add-' + targetsCategory +' button')

    alert('please fill all required fields')
    return;
  }

};

function handleCheckboxClick(elementRef, targetsCategory) {

    let week = document.querySelector(`#currentWeek`);

  apiReq('wekkly-target-is-checked', [{
    isChecked: elementRef.checked,
    id: elementRef.id,
    category: '<%=parentCategory%>',
    targets_category: targetsCategory,
    week:week.value
  }])

};

function editWeeklyTargets(id, targetsCategory, currTask) {

  let targetOwner = document.querySelector(`#${targetsCategory}-targets-owner-edit-${currTask}`);
  let targetDetails = document.querySelector(`#${targetsCategory}-targets-details-edit-${currTask}`);
  let week = document.querySelector(`#currentWeek`);
  let priority = document.querySelector(`#${targetsCategory}-set-priority-edit-${currTask}`)
  priority = priority.options[priority.selectedIndex].value;

  apiReq('wekkly-target-is-edit', [{
    task_owner: targetOwner.value,
    task_details: targetDetails.value,
    task_id: id,
    category: '<%=parentCategory%>',
    targets_category: targetsCategory,
    week: week.value,
    priority: priority
  }])
};

function deleteTask(taskId, targetsCategory) {

  apiReq('delete-task', {
    task_id: taskId,
    targets_category: targetsCategory,
    category: '<%=parentCategory%>'
  })

};

function checkPriDub(priorityNum, targetsCategory) {

  let values = document.querySelectorAll(`#${targetsCategory}-targets-table tbody tr`);
  let firstTdValues = [];
  let res = false

  values.forEach((tr) => {

    let firstTd = tr.querySelector('td:first-child');

    if (firstTd) {
      let firstTdValue = firstTd.textContent.trim();

      firstTdValues.push(firstTdValue);
    }
  });

  if (firstTdValues.includes(priorityNum)) {
    alert(`Priority ${priorityNum} is already set.`);
    res = true;
  }

  return res;
};

function toggleDropdown(dropdownId) {
  var dropdown = document.querySelector('#' + dropdownId + ' .dropdown-content').style.display = 'block'

};

function getSelectedValue(ele, drop) {

  document.querySelector('#' + drop + ' input').value = ele.innerText

  var dropdown = document.querySelector('#' + drop + ' .dropdown-content').style.display = 'none'

};

function filterOptions(dropdownId) {
  var input, filter, options, a, i;
  input = document.querySelector("#" + dropdownId + " input");
  filter = input.value.toUpperCase();
  options = document.querySelectorAll("#" + dropdownId + " .dropdown-content a");

  for (i = 0; i < options.length; i++) {
    a = options[i];
    if (a.innerText.toUpperCase().indexOf(filter) > -1) {
      options[i].style.display = "";
    } else {
      options[i].style.display = "none";
    }
  }
};
