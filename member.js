const id = sessionStorage.getItem("memberId");


if (id) {
    assignFormValues(id);
} else {
    document.title = 'New Member';
    document.getElementById("nameInput").value = "";
    document.getElementById("pronounInput").value = "";
    document.getElementById("descriptionInput").value = "";
    document.getElementById("preview").src = "Avatar.jpg";
    document.getElementById("export-btn").textContent = "Add Member";
}

function assignFormValues(id) {
    const request = indexedDB.open("MemberDB", 1);

    request.onsuccess = function (event) {
    const db = event.target.result;
    const tx = db.transaction("posts", "readonly");
    const store = tx.objectStore("posts");

    // Get record by ID
    const getRequest = store.get(id);

    getRequest.onsuccess = function () {
        const data = getRequest.result;
        if (data) {
            document.title = `Member - ${data.id}`;
            document.getElementById("nameInput").value = data.id;
            document.getElementById("pronounInput").value = data.pronouns;
            document.getElementById("descriptionInput").value = data.description;
            document.getElementById("export-btn").textContent = "Update Member";
            console.log(data.image)
            if (data.image) {
                document.getElementById("preview").src = data.image;
            } else {
                document.getElementById("preview").src = "Avatar.jpg";
            }
            
        } else {
            console.log("No data found");
        }
    };
    };
}