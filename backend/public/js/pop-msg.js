
async function showMessagePopup(message) {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.padding = "10px";
  popup.style.backgroundColor = "rgba(0,0,0,0.8)";
  popup.style.color = "white";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = 1000; // to ensure it appears above other elements
  popup.innerText = message;

  document.body.appendChild(popup);

  // Wait for 5 seconds using a promise
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Remove the message pop-up
  popup.remove();

  window.location.href = window.location.href;
}

async function simpleShowMessage(message,timer) {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.padding = "10px";
  popup.style.backgroundColor = "rgba(0,0,0,0.8)";
  popup.style.color = "white";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = 1000; // to ensure it appears above other elements
  popup.innerText = message;

  document.body.appendChild(popup);

  // Wait for 5 seconds using a promise
  await new Promise((resolve) => setTimeout(resolve, timer));

  // Remove the message pop-up
  popup.remove();

}

async function apiReq(path, bodyData) {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    if (response.ok) {
      const responseData = await response.json();
      showMessagePopup1(responseData.Success);
    } else {
      // Check if the response has content
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        showMessagePopup1(`Error submitting leaves: ${errorData.message}`);
      } else {
        showMessagePopup1("Error submitting leaves: Invalid response format");
      }
    }

    // setTimeout(() => {
    //   location.reload();
    // }, 3000);
  } catch (error) {
    // An error occurred during the fetch or parsing the response
    console.error(error);
    showMessagePopup("An unexpected error occurred");
  }
}

async function showMessagePopup1(message) {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.padding = "10px";
  popup.style.backgroundColor = "rgba(0,0,0,0.8)";
  popup.style.color = "white";
  popup.style.borderRadius = "5px";
  popup.style.zIndex = 1000; // to ensure it appears above other elements
  popup.innerText = message;

  document.body.appendChild(popup);

  // Remove the message pop-up
  popup.remove();

  window.location.href = window.location.href;
}

async function onFormSubmit(ids, apiAddress,additionData) {
  const formData = [];

  for (let i = 0; i < ids.length; i++) {
    const inputField = document.getElementById(`${ids[i]}`);

    if (!inputField) {
      console.error(`Element with id ${ids[i]} not found.`);
      continue; // Skip to the next iteration if the element is not found
    }

    let value;

    if (inputField.tagName === 'DIV') {
      // Handle radio button group
      let privileges = [];
      const radios = document.querySelectorAll(`#${ids[i]} input[type="checkbox"]`);

      for (let j = 0; j < radios.length; j++) {
        if (radios[j].checked) {
          privileges.push(radios[j].previousElementSibling.textContent.trim());
        }
      }

      value = privileges;
    } else if (inputField.tagName === 'TEXTAREA') {

      if(!inputField.value){
        simpleShowMessage('Please complete all required fields before submitting.',4000)
        hideAllBodyShowDivs()
        return
      }
      // Handle textarea input
      value = inputField.value;

    } else {
      // Handle other input types (text, checkbox, etc.)
      value = inputField.value;

      if (value === '') {
        alert('Please fill all required fields');
        return;
      }
    }

    console.log(additionData)

    formData.push({
      [`${inputField.previousElementSibling.textContent.trim().replace(/\s/g, "")}`]: value
    });

  }

  formData.push({
    [`category`]: additionData
  });
  
  await submitData(formData, apiAddress)
}

async function submitData(bodyData, apiAddress,callback = showMessagePopup1) {
  try {
    const response = await fetch(apiAddress, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyData),
    });

    if (response.ok) {
      const responseData = await response.json();
      callback(responseData.Success);
    } else {
      // Check if the response has content
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        callback(`Error submitting leaves: ${errorData.message}`);
      } else {
        callback("Error submitting leaves: Invalid response format");
      }
    }

  } catch (error) {
    // An error occurred during the fetch or parsing the response
    console.error(error);
    callback("An unexpected error occurred");
  }
}

async function likeDislike(action, ideaId, user) {
  try {

    submitData([action, ideaId, user],'idea-like-dislike')

  } catch (error) {
    console.error(error);
  }
}

function hideAllBodyShowDivs() {
  var bodyShowDivs = document.querySelectorAll('.body.show');
  
  bodyShowDivs.forEach(function(div) {
    div.style.display = 'none';
  });
}





