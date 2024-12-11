import { displayFileContent } from "./SelectItemFile.js";

document.addEventListener("DOMContentLoaded", () => {
	const leftNav = document.getElementById("leftNav");
    const treeView = document.getElementById("treeView");
    const contextMenu = document.getElementById("contextMenu");
    const addFolder = document.getElementById("addFolder");
    const addBookmark = document.getElementById("addBookmark");

    const bookmarkDialog = document.getElementById("bookmarkDialog");
    const saveBookmark = document.getElementById("saveBookmark");
    const cancelBookmark = document.getElementById("cancelBookmark");
    const titleInput = document.getElementById("titleInput");
    const tagsInput = document.getElementById("tagsInput");
    const urlInput = document.getElementById("urlInput");
    const thumbnailInput = document.getElementById("thumbnailInput");
	const mainPlayArea = document.getElementById("mainPlayArea");

    let folderStructure = [];
    let selectedFolder = null;

    // Render the tree view
    const renderTreeView = () => {
        treeView.innerHTML = "";

        const buildTree = (items, parent) => {
            items.forEach((item) => {
                const li = document.createElement("li");
                li.textContent = item.name;
                li.className = item.type;

                li.addEventListener("click", (event) => {
                    event.stopPropagation();
                    if (item.type === "folder") {
                        selectFolder(li, item);
                        const childUl = li.querySelector("ul");
                        if (childUl) {
                            childUl.classList.toggle("hidden");
                        }
                    } else if (item.type === "file") {
                        // Call the external function to display file content
                        displayFileContent(item, mainPlayArea);
                    }
                });

                li.addEventListener("contextmenu", (event) => {
                    event.preventDefault(); // Prevent default browser menu
                    //selectedFolder = item.type === "folder" ? item : null;
                    showContextMenu(event.pageX, event.pageY);
                });

                parent.appendChild(li);

                if (item.type === "folder" && item.children) {
                    const ul = document.createElement("ul");
                    ul.classList.add("hidden");
                    li.appendChild(ul);
                    buildTree(item.children, ul);
                }
            });
        };

        buildTree(folderStructure, treeView);
    };

    const selectFolder = (element, folder) => {
        const prevSelected = treeView.querySelector(".selected");
        if (prevSelected) prevSelected.classList.remove("selected");
        element.classList.add("selected");
        selectedFolder = folder;
    };

    const showContextMenu = (x, y) => {
        contextMenu.style.top = `${y}px`;
        contextMenu.style.left = `${x}px`;
        contextMenu.classList.remove("hidden");
    };

    const hideContextMenu = () => contextMenu.classList.add("hidden");

    const showBookmarkDialog = () => {
        bookmarkDialog.classList.remove("hidden");
    };
	

    const hideBookmarkDialog = () => {
        bookmarkDialog.classList.add("hidden");
        titleInput.value = "";
        tagsInput.value = "";
        urlInput.value = "";
        thumbnailInput.value = "";
    };

    saveBookmark.addEventListener("click", () => {
        const bookmark = {
            name: titleInput.value,
            tags: tagsInput.value.split(","),
            url: urlInput.value,
            thumbnail: thumbnailInput.files[0],
            type: "file",
        };

        if (selectedFolder) {
            selectedFolder.children.push(bookmark);
        } else {
            alert("Please select a folder to add the bookmark.");
        }

        renderTreeView();
        hideBookmarkDialog();
    });

    cancelBookmark.addEventListener("click", hideBookmarkDialog);

    addFolder.addEventListener("click", () => {
        const name = prompt("Enter folder name:");
        if (name) {
            const newFolder = {
                name,
                type: "folder",
                children: [],
            };

            if (selectedFolder) {
                selectedFolder.children.push(newFolder);
            } else {
                folderStructure.push(newFolder);
            }

            renderTreeView();
        }
        hideContextMenu();
    });

    addBookmark.addEventListener("click", () => {
        showBookmarkDialog();
        hideContextMenu();
    });

    /*// Add custom context menu for tree view
    treeView.addEventListener("contextmenu", (event) => {
        event.preventDefault(); // Prevent default browser context menu
        selectedFolder = null; // Reset selected folder to root if empty space is clicked
        showContextMenu(event.pageX, event.pageY);
    });*/

// Right-click on the left navigation (empty space)
    leftNav.addEventListener("contextmenu", (event) => {
        if (event.target === leftNav || event.target === treeView) {
            event.preventDefault();
            selectedFolder = null; // Root level
            showContextMenu(event.pageX, event.pageY);
        }
    });
	
    // Hide context menu when clicking anywhere else
    document.addEventListener("click", hideContextMenu);

    renderTreeView();
});
