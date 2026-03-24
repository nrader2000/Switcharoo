/* Place your JavaScript in this file */

var $TABLE = $('#table');
var $TABLE2 = $('#table2');

const input = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const submit = document.getElementById("postform");
const select = document.getElementById("frontdropdown");

const date = new Date();
let year = date.getFullYear();
document.getElementById("year").innerHTML = year;

var coll = document.getElementsByClassName("collapsible");

for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

if (input){
  input.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
    }
  });
}

$('.table-add').click(function () {
  populate();
  var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
  $TABLE.find('table').append($clone);
  var $timeCell = $clone.find('.timeCell');
  if ($timeCell.length === 0) {
    $timeCell = $('<td class="data table-td timeCell"></td>');
    $clone.append($timeCell);
  }
  setTime($timeCell);
});

$('.table-remove').click(function () {
  $(this).parents('tr').detach();
});


// fronter stuff
const fronters = indexedDB.open("FronterDB",2);

fronters.onupgradeneeded = function (event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("posts2")) {
    db.createObjectStore("posts2", { keyPath: "id" });
  }
};

fronters.onsuccess = function (event) {
  console.log('FronterDB ready');
  window.db2 = event.target.result; // global reference
  loadTableData2(window.db2);
};

fronters.onerror = function (event) {
  console.error("Error opening FronterDB", event);
};

function setTime(cell){
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  cell.text(now);
}

function populate(){
  const frontdrop = document.getElementById("frontdropdown");
  const rows = document.querySelectorAll("#table2 tr");
  frontdrop.innerHTML = "";
  const defaultoption = new Option("Choose Member","");
  frontdrop.appendChild(defaultoption);
  [...rows].slice(1).forEach(row => {
    const text = row.cells[0].textContent.trim();
    const option = new Option(text,text);
    frontdrop.appendChild(option);
  });
}


document.body.addEventListener("change", (e) => {
  if (e.target.matches("#frontdropdown")) {
    console.log("saved fronter!")
    if (e.target.value !== "") {
      const text = document.createElement("span");
      text.classList.add("data");
      text.classList.add("table-td");
      text.textContent = e.target.options[e.target.selectedIndex].text;

      const row = e.target.closest("tr");
      console.log("Clicked row:", row);
      const front_time = row.cells[1].textContent.trim();
      const post = {
        id: Date.now(), // Simple ID generation
        front_name: text.textContent,
        front_time: front_time
      };
      saveFronter(post);

      // Replace select with text
      e.target.replaceWith(text);
    }
  }
});

function saveFronter(post) {
  if (!window.db2) {
    console.error("DB2 not ready yet");
    return;
  }

  const tx = db2.transaction("posts2", "readwrite");
  const store = tx.objectStore("posts2");

  store.put(post); // add or update

  tx.oncomplete = () => {
    console.log("Fronter saved:", post);
  };

  tx.onerror = (e) => {
    console.error("Transaction failed:", e.target.error);
  };
}

function loadTableData2(db2) {
  const transaction = db2.transaction("posts2", "readonly");
  const store = transaction.objectStore("posts2");

  const request = store.getAll();

  request.onsuccess = function () {
    const data = request.result;
    const tbody = document.querySelector("#table tbody");

    if (tbody){
      tbody.innerHTML = ""; // clear existing rows

      data.forEach(item => {
        const row = document.createElement("tr");
        row.dataset.id = item.id; // Store ID for reference

        row.innerHTML = `
          <td class="data table-td"><a class="member-ref">${item.front_name}</a></td>
          <td class="data table-td">${item.front_time}</td>
          <td>
            <span class="table-remove glyphicon glyphicon-remove remove-member2"></span>
          </td>
        `;

        tbody.appendChild(row);
      });
    }
  };
}

document.addEventListener("click", function (e) {
  if (e.target.matches(".remove-member2")) {
    const row = e.target.closest("tr");
    const id = Number(row.dataset.id); // Get ID from data attribute
    deleteItem2(id);
  }
});

function deleteItem2(id) {       
    const transaction = db2.transaction("posts2", "readwrite");
    const store = transaction.objectStore("posts2");
    const deleteRequest = store.delete(id);
    deleteRequest.onsuccess = function () {
      console.log("Fronter deleted:", id);
      loadTableData2(db2);
    };
    deleteRequest.onerror = function () {
      console.error("Delete failed");
    };    
};


// member stuff
const members = indexedDB.open("MemberDB",1);

members.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("posts", { keyPath: "id" });
};

members.onsuccess = function (event) {
  console.log('MemberDB ready');
  window.db = event.target.result;
  loadTableData(window.db);
};

members.onerror = function () {
  console.log("Error opening DB");
};

if (submit) {
  document.getElementById("postform").addEventListener("submit", function (e) {
  e.preventDefault();
  
  const member_name = document.getElementById("nameInput").value;
  const member_pronouns = document.getElementById("pronounInput").value;
  const member_description = document.getElementById("descriptionInput").value;
  const member_avatar = document.getElementById("fileInput").files[0];

  if (member_avatar) {
    const reader = new FileReader();
    reader.onload = function () {
      const post = {
        id: member_name,
        pronouns : member_pronouns,
        description: member_description,
        image : reader.result
      };
      savePost(post);
    };
    reader.readAsDataURL(member_avatar);
  }
  if (preview.src !== "Avatar.jpg") {
    const post = {
      id: member_name,
      pronouns : member_pronouns,
      description: member_description,
      image : preview.src
    };
    savePost(post);
  }
  else {
    const post = {
      id: member_name,
      pronouns : member_pronouns,
      description: member_description,
      image : null
    };
    savePost(post);
  }
  });
}

function savePost(post) {
  const tx = db.transaction("posts", "readwrite");
  const store = tx.objectStore("posts");

  store.put(post); // add or update

  tx.oncomplete = () => {
    console.log("Post saved!");
    console.log(post)
  };

  tx.onerror = () => {
    console.error("Error saving post");
  };

  window.location.href = "index.html";
}

function loadTableData(db) {
  const transaction = db.transaction("posts", "readonly");
  const store = transaction.objectStore("posts");

  const request = store.getAll();

  request.onsuccess = function () {
    const data = request.result;
    const tbody = document.querySelector("#table2 tbody");

    if (tbody){
      tbody.innerHTML = ""; // clear existing rows

      data.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td class="data table-td"><a class="member-ref">${item.id}</a></td>
          <td>
            <span class="table-remove glyphicon glyphicon-remove remove-member"></span>
          </td>
        `;

        tbody.appendChild(row);
      });
    }
  };
}

document.addEventListener("click", function (e) {
  if (e.target.matches(".remove-member")) {
    const row = e.target.closest("tr");

    console.log("Clicked row:", row);
    console.log("Row index:", row.rowIndex);

    // Example: get cell values
    const cells = row.querySelectorAll("td");
    var id = cells[0].textContent;
    deleteItem(id);
  }
  if (e.target.matches(".member-ref")) {
    const row = e.target.closest("tr");

    console.log("Clicked row:", row);
    console.log("Row index:", row.rowIndex);

    // Example: get cell values
    const cells = row.querySelectorAll("td");
    var id = cells[0].textContent;
    sessionStorage.setItem("memberId",id);
    window.location.href = `member.html`;
  }
  if (e.target.matches(".member-link")) {
    sessionStorage.setItem("memberId",null);
  }
});

function deleteItem(id) {
  const request = indexedDB.open("MemberDB", 1);

  request.onsuccess = function (event) {
    const db = event.target.result;

    const transaction = db.transaction("posts", "readwrite");
    const store = transaction.objectStore("posts");

    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = function () {
      console.log("Item deleted:", id);
      loadTableData(db);
    };

    deleteRequest.onerror = function () {
      console.error("Delete failed");
    };
  };
}