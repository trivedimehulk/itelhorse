let bookmarks = [];
let selectedFolderId = null;


$(function () {
  // Initialize jsTree
  $(function () {
  $('#folderTree').jstree({
    core: {
      check_callback: true,
      themes: {
        dots: true,
        icons: true,
        stripes: false,
      },
      data: [
  {
    id: "root",
    text: "Suits Universe",
    children: []
  }
],

    },
    plugins: ["contextmenu"], // Enable the contextmenu plugin
    contextmenu: {
      items: function ($node) {
        return {
          RenameFolder: {
            label: "Rename Folder",
            _disabled: $node.id === "root", // disable if it's the root node
            action: function () {
              if ($node.id === "root") return; // extra safety check
              const currentName = $node.text;
              const newName = prompt("Enter new folder name:", currentName);
              if (newName && newName.trim() !== "") {
                $('#folderTree').jstree().rename_node($node, newName.trim());
              }
            }
          },                   
          CreateFolder: {
            label: "Create Folder",
            action: function () {
              const parentId = $node ? $node.id : "#"; // If no node, use root
              const newNode = $('#folderTree').jstree().create_node(parentId, { text: "New Folder", children: [] });
              $('#folderTree').jstree().edit(newNode);
            },
          },
          CreateBookmark: {
            label: "Create Bookmark",
            action: function () {
              selectedFolderId = $node ? $node.id : null; // Set folder ID or null for root
              openModal(); // Open the modal for creating a bookmark
            },
          },
          DeleteFolder: {
            label: "Delete Folder",
            action: function () {
              const selectedNode = $('#folderTree').jstree("get_selected", true)[0];
              if (!selectedNode) {
                alert("Please select a folder to delete.");
                return;
              }

              const folderId = selectedNode.id;
              if (folderId === "root") {
                alert("Root folder cannot be deleted.");
                return;
              }

              $('#folderTree').jstree().delete_node(selectedNode);
              bookmarks = bookmarks.filter(b => b.folderId !== folderId);
              console.log(`Folder ${folderId} and its bookmarks were removed.`);
            }
          }
        };
      }
    }
  });

  // Enable context menu on the entire left navigation (including empty space)
  $('#folderTreeContainer').on('contextmenu', function (e) {
    e.preventDefault(); // Prevent the browser's default context menu

    // Determine if the click is on a node or empty area
    const instance = $.jstree.reference('#folderTree');
    const node = instance ? instance.get_node(e.target) : null;

    if (node && node.id) {
      // Right-clicked on a node
      instance.select_node(node);
    } else {
      // Right-clicked on an empty area
      instance.deselect_all(); // Deselect any selected nodes
    }

    // Trigger the custom context menu
    $('#folderTree').trigger('contextmenu', {
      node: node || null, // Pass the clicked node or null
    });
  });
});



  $('#folderTree').on('select_node.jstree', function (e, data) {
    selectedFolderId = data.node.id;
    displayBookmarks(); // Refresh the bookmark list for the selected folder
  });
});

// Save Bookmark
function saveBookmark1() {
  const title = document.getElementById('title').value.trim();
  const tags = document.getElementById('tags').value.trim();
  const url = document.getElementById('url').value.trim();
  const imageInput = document.getElementById('image');
  const image = imageInput.files[0] ? URL.createObjectURL(imageInput.files[0]) : null;
debugger;
  if (!title || !url) {
    alert('Please fill in both the Title and URL fields.');
    return;
  }

  if (!selectedFolderId) {
    alert('Please select a folder to create the bookmark.');
    return;
  }

  const bookmark = {
    id: Date.now(),
    folderId: selectedFolderId,
    title,
    tags,
    url,
    image,
  };

  bookmarks.push(bookmark); // Add the bookmark to the global array
  closeModal(); // Close the modal
  displayBookmarks(); // Refresh the bookmark list in the right-hand panel
}


function saveBookmark() {
  const title = document.getElementById('title').value.trim();
  const tags = document.getElementById('tags').value.trim();
  const url = document.getElementById('url').value.trim();
  const imageInput = document.getElementById('image');

  if (!title || !url) {
    alert('Please fill in both the Title and URL fields.');
    return;
  }

  if (!selectedFolderId) {
    alert('Please select a folder to create the bookmark.');
    return;
  }

  debugger;
  // Check for duplicate URL
  const isDuplicate = bookmarks.some(bookmark => bookmark.url === url);
  if (isDuplicate) {
    alert('A bookmark with the same URL already exists.');
    return;
  }

  const file = imageInput.files[0];

  if (file) {
    // Validate image size
    const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
    if (file.size > maxSizeInBytes) {
      alert('The selected image is too large. Please select an image smaller than 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const image = e.target.result;
      finalizeSaveBookmark(title, tags, url, image);
    };
    reader.readAsDataURL(file);
  } else {
    finalizeSaveBookmark(title, tags, url, null);
  }
}
function saveBookmark2() {
  const title = document.getElementById('title').value.trim();
  const tags = document.getElementById('tags').value.trim();
  const url = document.getElementById('url').value.trim();
  const imageInput = document.getElementById('image');

  if (!title || !url) {
    alert('Please fill in both the Title and URL fields.');
    return;
  }

  if (!selectedFolderId) {
    alert('Please select a folder to create the bookmark.');
    return;
  }

  
  // Determine if editing an existing bookmark
  const editingBookmarkId = document.getElementById('bookmarkId').value; // Assume a hidden field for bookmark ID


  const isEditing = !!editingBookmarkId;

  // Check for duplicate URL, excluding the current bookmark being edited
  const isDuplicate = bookmarks.some(bookmark => bookmark.url === url && bookmark.id !== parseInt(editingBookmarkId, 10));
  if (isDuplicate) {
    alert('A bookmark with the same URL already exists.');
    return;
  }

  const file = imageInput.files[0];

  if (file) {
    // Validate image size
    const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
    if (file.size > maxSizeInBytes) {
      alert('The selected image is too large. Please select an image smaller than 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const image = e.target.result;
      finalizeSaveBookmark(title, tags, url, image, editingBookmarkId);
    };
    reader.readAsDataURL(file);
  } else {
    finalizeSaveBookmark(title, tags, url, null, editingBookmarkId);
  }
}

function finalizeSaveBookmark(title, tags, url, image, bookmarkId = null) {
  if (bookmarkId) {
    // Update existing bookmark
    const bookmark = bookmarks.find(b => b.id === parseInt(bookmarkId, 10));
    if (bookmark) {
      bookmark.title = title;
      bookmark.tags = tags;
      bookmark.url = url;
      bookmark.image = image;
    }
  } else {
    // Add new bookmark
    const bookmark = {
      id: Date.now(),
      folderId: selectedFolderId,
      title,
      tags,
      url,
      image,
    };
    bookmarks.push(bookmark);
  }

  closeModal();
  displayBookmarks();
}


function saveBookmark2bk() {
  const title = document.getElementById('title').value.trim();
  const tags = document.getElementById('tags').value.trim();
  const url = document.getElementById('url').value.trim();
  const imageInput = document.getElementById('image');

  if (!title || !url) {
    alert('Please fill in both the Title and URL fields.');
    return;
  }

  if (!selectedFolderId) {
    alert('Please select a folder to create the bookmark.');
    return;
  }
  
  // Determine if editing an existing bookmark
  const editingBookmarkId = document.getElementById('bookmarkId').value; // Assume a hidden field for bookmark ID
  const isEditing = !!editingBookmarkId;

  // Check for duplicate URL, excluding the current bookmark being edited
  const isDuplicate = bookmarks.some(bookmark => bookmark.url === url && bookmark.id !== parseInt(editingBookmarkId, 10));
  if (isDuplicate) {
    alert('A bookmark with the same URL already exists.');
    return;
  }

  const file = imageInput.files[0];

  if (file) {
    // Validate image size
    const maxSizeInBytes = 1 * 1024 * 1024; // 1 MB
    if (file.size > maxSizeInBytes) {
      alert('The selected image is too large. Please select an image smaller than 1MB.');
      return;
    }
  }
  // Encode image as Base64
  //const file = imageInput.files[0];
  let image = null;
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image = e.target.result; // Base64 string

      // Save the bookmark after encoding the image
      const bookmark = {
        id: Date.now(),
        folderId: selectedFolderId,
        title,
        tags,
        url,
        image, // Store the Base64 image data
      };

      bookmarks.push(bookmark); // Add the bookmark to the global array
      closeModal(); // Close the modal
      displayBookmarks(); // Refresh the right-hand panel
    };
    reader.readAsDataURL(file); // Read the image as a Base64 data URL
  } else {
    // No image selected, proceed without encoding
    const bookmark = {
      id: Date.now(),
      folderId: selectedFolderId,
      title,
      tags,
      url,
      image: null,
    };

    bookmarks.push(bookmark); // Add the bookmark to the global array
    closeModal(); // Close the modal
    displayBookmarks(); // Refresh the right-hand panel
  }
}


// Display Bookmarks
function displayBookmarks() {
  const list = document.getElementById('bookmarkList');
  list.innerHTML = '';

  const folderBookmarks = bookmarks.filter(b => b.folderId === selectedFolderId);

  if (folderBookmarks.length === 0) {
    list.innerHTML = `<p>Why don't you add some...</p>`;
    return;
  }

  folderBookmarks.forEach(bookmark => {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.draggable = true; // Enable dragging
    div.setAttribute('data-bookmark-id', bookmark.id); // Store bookmark ID in the element

    div.innerHTML = `
      <img src="${bookmark.image || 'https://via.placeholder.com/100'}" alt="${bookmark.title}">
      <span>${bookmark.title}</span>
    `;

    // Drag start event
    div.ondragstart = (event) => {
      event.dataTransfer.setData('text/plain', JSON.stringify(bookmark));
      event.dataTransfer.effectAllowed = 'move';
    };

    // Left-click to open the URL
    div.onclick = () => openBookmarkUrl(bookmark.url);

    // Handle right-click to show context menu
    div.oncontextmenu = (event) => {
      event.preventDefault(); // Prevent the default browser menu
      showContextMenu(event, bookmark);
    };

    list.appendChild(div);
  });
}


function displayBookmarks2() {
  const list = document.getElementById('bookmarkList');
  list.innerHTML = '';

  const folderBookmarks = bookmarks.filter(b => b.folderId === selectedFolderId);

  if (folderBookmarks.length === 0) {
    list.innerHTML = `<p>Why don't you add some...</p>`;
    return;
  }

  folderBookmarks.forEach(bookmark => {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.innerHTML = `
      <img src="${bookmark.image || 'https://via.placeholder.com/100'}" alt="${bookmark.title}">
      <span>${bookmark.title}</span>
    `;

    // Handle left-click to open URL
    div.onclick = () => openBookmarkUrl(bookmark.url);

    // Handle right-click to show context menu
    div.oncontextmenu = (event) => {
      event.preventDefault(); // Prevent the default browser menu
      showContextMenu(event, bookmark);
    };

    list.appendChild(div);
  });
}


function displayBookmarks1() {
  const list = document.getElementById('bookmarkList');
  list.innerHTML = '';

  // Get bookmarks for the selected folder
  const folderBookmarks = bookmarks.filter(b => b.folderId === selectedFolderId);

  if (folderBookmarks.length === 0) {
    list.innerHTML = `<p>Why don't you add some...</p>`;
    return;
  }

  folderBookmarks.forEach(bookmark => {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.innerHTML = `
      <img src="${bookmark.image || 'https://via.placeholder.com/100'}" alt="${bookmark.title}">
      <span>${bookmark.title}</span>
    `;
    div.onclick = () => openModal(bookmark); // Open modal with bookmark details
    list.appendChild(div);
  });
}

// Open Modal


function openModal(bookmark = null) {
  const modal = document.getElementById('bookmarkModal');
  modal.style.display = 'block';
  document.getElementById('bookmarkForm').reset();

  // Populate fields for editing an existing bookmark
  if (bookmark) {
    document.getElementById('title').value = bookmark.title;
    document.getElementById('tags').value = bookmark.tags;
    document.getElementById('url').value = bookmark.url;

    // Populate hidden bookmarkId field
    document.getElementById('bookmarkId').value = bookmark.id;
    
  } else {
    // Clear hidden bookmarkId field for new bookmarks
    document.getElementById('bookmarkId').value = '';
  }
}

function openModal1(bookmark = null) {
  const modal = document.getElementById('bookmarkModal');
  modal.style.display = 'block';
  modal.classList.add('animate__zoomIn');

  // Reset fields if creating a new bookmark
  document.getElementById('bookmarkForm').reset();
  if (bookmark) {
    document.getElementById('title').value = bookmark.title;
    document.getElementById('tags').value = bookmark.tags;
    document.getElementById('url').value = bookmark.url;
  }
}

// Close Modal
function closeModal() {
  const modal = document.getElementById('bookmarkModal');
  modal.classList.replace('animate__zoomIn', 'animate__zoomOut');
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('animate__zoomOut');
  }, 500);
}

// Export Tree with Details
function exportTreeWithDetails1() {
	debugger;
  const treeData = $('#folderTree').jstree(true).get_json('#', { flat: false });

  function enrichTreeWithBookmarks(treeNode) {
    if (treeNode.id !== "root") {
      const folderBookmarks = bookmarks.filter(b => b.folderId === treeNode.id);
      treeNode.bookmarks = folderBookmarks.map(b => ({
        title: b.title,
        tags: b.tags,
        url: b.url,
        image: b.image,
      }));
    }

    if (treeNode.children) {
      treeNode.children.forEach(child => enrichTreeWithBookmarks(child));
    }
  }

  treeData.forEach(rootNode => enrichTreeWithBookmarks(rootNode));

  const json = JSON.stringify(treeData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'full_tree_with_bookmarks.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportTreeWithDetails() {
	debugger;
  const treeData = $('#folderTree').jstree(true).get_json('#', { flat: false });

  // Recursive function to enrich the tree nodes with bookmarks
  function enrichTreeWithBookmarks(treeNode) {
    if (treeNode.id !== "root") {
      const folderBookmarks = bookmarks.filter(b => b.folderId === treeNode.id);
      treeNode.bookmarks = folderBookmarks.map(b => ({
        title: b.title,
        tags: b.tags,
        url: b.url,
        image: b.image,
      }));
    }

    if (treeNode.children && treeNode.children.length > 0) {
      treeNode.children.forEach(child => enrichTreeWithBookmarks(child));
    }
  }

  // Enrich the root nodes
  treeData.forEach(rootNode => enrichTreeWithBookmarks(rootNode));

  // Convert to JSON and save
  const json = JSON.stringify(treeData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'full_tree_with_bookmarks.json';
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('exportTreeButton').addEventListener('click', exportTreeWithDetails);
var impTreeEvnt=0;
function importTreeWithDetails1(event) {
	debugger
	
	impTreeEvnt = impTreeEvnt++;

	if(impTreeEvnt==0){
		const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    try {
      const treeData = JSON.parse(reader.result);

      // Destroy the existing tree to avoid duplicates
      //$('#folderTree').jstree("destroy").empty();

      // Initialize a new tree with empty data
      $('#folderTree').jstree({
        core: {
          check_callback: true,
          themes: {
            dots: true,
            icons: true,
            stripes: false,
          },
          data: [],
        },
      });

      bookmarks = []; // Reset the global bookmarks array

      // Recursive function to load tree nodes and bookmarks
      function loadTreeWithBookmarks(treeNode, parentId = "#") {
        // Add the node to the tree
        $('#folderTree').jstree().create_node(parentId, {
          id: treeNode.id,
          text: treeNode.text,
        }, 'last');

        // Add bookmarks to the global bookmarks array
        if (treeNode.bookmarks) {
          treeNode.bookmarks.forEach(b => {
            bookmarks.push({
              folderId: treeNode.id,
              title: b.title,
              tags: b.tags,
              url: b.url,
              image: b.image, // Base64 image
            });
          });
        }

        // Recursively process children nodes
        if (treeNode.children && treeNode.children.length > 0) {
          treeNode.children.forEach(child => {
            loadTreeWithBookmarks(child, treeNode.id);
          });
        }
      }

		debugger
      // Load each root node in the treeData
      treeData.forEach(rootNode => loadTreeWithBookmarks(rootNode));

      // Refresh the tree to apply changes
      //$('#folderTree').jstree(true).refresh();
      console.log("Tree import completed successfully.");
    } catch (error) {
      console.error("Error importing tree:", error.message);
      alert('Invalid JSON structure: ' + error.message);
    }
  };

  reader.readAsText(file);
	}
}

function importTreeWithDetails2(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    try {
      const treeData = JSON.parse(reader.result);

      // Defensive code to avoid duplicate imports
      if ($('#folderTree').jstree(true)) {
        $('#folderTree').jstree("destroy").empty(); // Destroy the existing tree
      }

      // Initialize a fresh tree
      $('#folderTree').jstree({
        core: {
          check_callback: true,
          themes: {
            dots: true,
            icons: true,
            stripes: false,
          },
          data: [], // Start with empty data
        },
      });

      bookmarks = []; // Reset bookmarks

      // Recursive function to load tree nodes and bookmarks
      function loadTreeWithBookmarks(treeNode, parentId = "#") {
        // Add the node to the tree
        $('#folderTree').jstree().create_node(parentId, {
          id: treeNode.id,
          text: treeNode.text,
        }, 'last');

        // Add bookmarks to the global bookmarks array
        if (treeNode.bookmarks) {
          treeNode.bookmarks.forEach(b => {
            bookmarks.push({
              folderId: treeNode.id,
              title: b.title,
              tags: b.tags,
              url: b.url,
              image: b.image,
            });
          });
        }

        // Recursively process child nodes
        if (treeNode.children && treeNode.children.length > 0) {
          treeNode.children.forEach(child => {
            loadTreeWithBookmarks(child, treeNode.id);
          });
        }
      }

      // Load root nodes from the treeData
      treeData.forEach(rootNode => loadTreeWithBookmarks(rootNode));

      // Refresh the tree to render nodes
      $('#folderTree').jstree(true).refresh();
      console.log("Tree imported successfully.");
    } catch (error) {
      console.error("Error importing tree:", error.message);
      alert('Invalid JSON structure: ' + error.message);
    }
  };

  reader.readAsText(file);
}

function importTreeWithDetails3(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    try {
      const treeData = JSON.parse(reader.result);

      // Destroy the existing tree to avoid duplicates
      if ($.jstree.reference('#folderTree')) {
        $('#folderTree').jstree("destroy").empty(); // Destroy and clear the tree
      }

      bookmarks = []; // Reset the global bookmarks array

      // Recursive function to load tree nodes and bookmarks
      function loadTreeWithBookmarks(treeNode, parentId = "#") {
        // Add the node to the tree
        $('#folderTree').jstree().create_node(parentId, {
          id: treeNode.id,
          text: treeNode.text,
        }, 'last');

        // Add bookmarks to the global bookmarks array
        if (treeNode.bookmarks) {
          treeNode.bookmarks.forEach(b => {
            bookmarks.push({
              folderId: treeNode.id,
              title: b.title,
              tags: b.tags,
              url: b.url,
              image: b.image,
            });
          });
        }

        // Recursively process child nodes
        if (treeNode.children && treeNode.children.length > 0) {
          treeNode.children.forEach(child => {
            loadTreeWithBookmarks(child, treeNode.id);
          });
        }
      }

      // Reinitialize the tree
      $('#folderTree').jstree({
        core: {
          check_callback: true,
          themes: {
            dots: true,
            icons: true,
            stripes: false,
          },
          data: [], // Initialize with empty data
        },
      });

      // Load root nodes into the tree
      treeData.forEach(rootNode => loadTreeWithBookmarks(rootNode));

      // Refresh the tree to apply changes
      $('#folderTree').jstree(true).refresh();
      console.log("Tree imported successfully.");
    } catch (error) {
      console.error("Error importing tree:", error.message);
      alert('Invalid JSON structure: ' + error.message);
    }
  };

  reader.readAsText(file);
}

function importTreeWithDetails4(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    try {
      const treeData = JSON.parse(reader.result);

      // Destroy the existing tree to avoid duplicates
      if ($.jstree.reference('#folderTree')) {
        $('#folderTree').jstree("destroy").empty(); // Destroy and clear the tree
      }

      // Reset bookmarks
      bookmarks = [];

      // Reinitialize the tree with the imported data
      $('#folderTree').jstree({
        core: {
          check_callback: true,
          themes: {
            dots: false,
            icons: true,
            stripes: false,
          },
          data: treeData, // Load the imported tree data directly here
        },
      });

      // Process bookmarks and associate them with folders
      function processBookmarks(treeNode) {
        if (treeNode.bookmarks) {
          treeNode.bookmarks.forEach(b => {
            bookmarks.push({
              folderId: treeNode.id,
              title: b.title,
              tags: b.tags,
              url: b.url,
              image: b.image,
            });
          });
        }

        // Recurse into child nodes
        if (treeNode.children && treeNode.children.length > 0) {
          treeNode.children.forEach(processBookmarks);
        }
      }

      // Process all root nodes for bookmarks
      treeData.forEach(processBookmarks);

      console.log("Tree and bookmarks imported successfully.");
    } catch (error) {
      console.error("Error importing tree:", error.message);
      alert('Invalid JSON structure: ' + error.message);
    }
  };

  reader.readAsText(file);
}


function importTreeWithDetails(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    try {
      const treeData = JSON.parse(reader.result);

      // Destroy the existing tree to avoid duplicates
      if ($.jstree.reference('#folderTree')) {
        $('#folderTree').jstree("destroy").empty(); // Destroy and clear the tree
      }

      bookmarks = []; // Reset the global bookmarks array

      // Reinitialize the tree with the imported data
      $('#folderTree').jstree({
        core: {
          check_callback: true,
          themes: {
            dots: true,
            icons: true,
            stripes: false,
          },
          data: treeData,
        },
        plugins: ["contextmenu"], // Enable the contextmenu plugin
        contextmenu: {
          items: function ($node) {
            return {
              RenameFolder: {
                label: "Rename Folder",
                _disabled: $node.id === "root", // disable if it's the root node
                action: function () {
                  if ($node.id === "root") return; // extra safety check
                  const currentName = $node.text;
                  const newName = prompt("Enter new folder name:", currentName);
                  if (newName && newName.trim() !== "") {
                    $('#folderTree').jstree().rename_node($node, newName.trim());
                  }
                }
              }, 
              CreateFolder: {
                label: "Create Folder",
                action: function () {
                  const parentId = $node ? $node.id : "#"; // If no node, use root
                  const newNode = $('#folderTree').jstree().create_node(parentId, { text: "New Folder", children: [] });
                  $('#folderTree').jstree().edit(newNode);
                },
              },
              CreateBookmark: {
                label: "Create Bookmark",
                action: function () {
                  selectedFolderId = $node ? $node.id : null; // Set folder ID or null for root
                  openModal(); // Open the modal for creating a bookmark
                },
              },
              DeleteFolder: {
                label: "Delete Folder",
                action: function () {
                  const selectedNode = $('#folderTree').jstree("get_selected", true)[0];
                  if (!selectedNode) {
                    alert("Please select a folder to delete.");
                    return;
                  }

                  const folderId = selectedNode.id;
                  if (folderId === "root") {
                    alert("Root folder cannot be deleted.");
                    return;
                  }

                  $('#folderTree').jstree().delete_node(selectedNode);
                  bookmarks = bookmarks.filter(b => b.folderId !== folderId);
                  console.log(`Folder ${folderId} and its bookmarks were removed.`);
                }
              }
            };
          }
        },
      });

      // Recursive function to process bookmarks
      function processBookmarks(treeNode) {
        if (treeNode.bookmarks) {
          treeNode.bookmarks.forEach(b => {
            bookmarks.push({
              folderId: treeNode.id,
              title: b.title,
              tags: b.tags,
              url: b.url,
              image: b.image,
            });
          });
        }

        if (treeNode.children && treeNode.children.length > 0) {
          treeNode.children.forEach(processBookmarks);
        }
      }

      // Process all nodes for bookmarks
      treeData.forEach(processBookmarks);
	  // Display bookmarks for the currently selected folder
      $('#folderTree').on('select_node.jstree', function (e, data) {
        selectedFolderId = data.node.id;
        displayBookmarks(); // Refresh the bookmark list for the selected folder
      });

      console.log("Tree and bookmarks imported successfully.");
    } catch (error) {
      console.error("Error importing tree:", error.message);
      alert('Invalid JSON structure: ' + error.message);
    }
  };

  reader.readAsText(file);
}

// Reattach the event listener for the import button
$('#importFile').off('change').on('change', importTreeWithDetails);


function importTreeWithDetails5(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function () {
    try {
      const treeData = JSON.parse(reader.result);

      // Destroy the existing tree to avoid duplicates
      if ($.jstree.reference('#folderTree')) {
        $('#folderTree').jstree("destroy").empty(); // Destroy and clear the tree
      }

      bookmarks = []; // Reset the global bookmarks array

      // Reinitialize the tree with the imported data
      $('#folderTree').jstree({
        core: {
          check_callback: true,
          themes: {
            dots: false,
            icons: true,
            stripes: false,
          },
          data: treeData, // Load the imported tree data directly
		  plugins: ["contextmenu"], // Enable the contextmenu plugin
    contextmenu: {
      items: function ($node) {
        return {
          CreateFolder: {
            label: "Create Folder",
            action: function () {
              const parentId = $node ? $node.id : "#"; // If no node, use root
              const newNode = $('#folderTree').jstree().create_node(parentId, { text: "New Folder", children: [] });
              $('#folderTree').jstree().edit(newNode);
            },
          },
          CreateBookmark: {
            label: "Create Bookmark",
            action: function () {
              selectedFolderId = $node ? $node.id : null; // Set folder ID or null for root
              openModal(); // Open the modal for creating a bookmark
            },
          },
          DeleteFolder: {
            label: "Delete Folder",
            action: function () {
              const selectedNode = $('#folderTree').jstree("get_selected", true)[0];
              if (!selectedNode) {
                alert("Please select a folder to delete.");
                return;
              }

              const folderId = selectedNode.id;
              if (folderId === "root") {
                alert("Root folder cannot be deleted.");
                return;
              }

              $('#folderTree').jstree().delete_node(selectedNode);
              bookmarks = bookmarks.filter(b => b.folderId !== folderId);
              console.log(`Folder ${folderId} and its bookmarks were removed.`);
            }
          }
        };
      }
    }
        },
      });

      // Recursive function to process bookmarks
      function processBookmarks(treeNode) {
        if (treeNode.bookmarks) {
          treeNode.bookmarks.forEach(b => {
            bookmarks.push({
              folderId: treeNode.id,
              title: b.title,
              tags: b.tags,
              url: b.url,
              image: b.image,
            });
          });
        }

        // Recurse into child nodes
        if (treeNode.children && treeNode.children.length > 0) {
          treeNode.children.forEach(processBookmarks);
        }
      }

      // Process bookmarks for all nodes
      treeData.forEach(processBookmarks);

      // Display bookmarks for the currently selected folder
      $('#folderTree').on('select_node.jstree', function (e, data) {
        selectedFolderId = data.node.id;
        displayBookmarks(); // Refresh the bookmark list for the selected folder
      });
	  
	  

      console.log("Tree and bookmarks imported successfully.");
    } catch (error) {
      console.error("Error importing tree:", error.message);
      alert('Invalid JSON structure: ' + error.message);
    }
  };

  reader.readAsText(file);
}

$('#folderTree').on('contextmenu', function (e) {
  e.preventDefault(); // Prevent the browser's default context menu
});


//document.getElementById('importFile').addEventListener('change', importTreeWithDetails);
$('#importFile').off('change').on('change', importTreeWithDetails);

document.getElementById('saveBookmark').addEventListener('click', saveBookmark2);

function searchBookmarks() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const list = document.getElementById('bookmarkList');
  list.innerHTML = '';

  if (query === '') {
    // If the search query is empty, show bookmarks for the selected folder
    displayBookmarks();
    return;
  }

  // Perform a global search across all bookmarks
  const matchingBookmarks = bookmarks.filter(bookmark =>
    (bookmark.title && bookmark.title.toLowerCase().includes(query)) ||
    (bookmark.tags && bookmark.tags.toLowerCase().includes(query)) ||
    (bookmark.url && bookmark.url.toLowerCase().includes(query))
  );

  if (matchingBookmarks.length === 0) {
    list.innerHTML = `<p>No results found...</p>`;
    return;
  }

  // Display matching bookmarks
  matchingBookmarks.forEach(bookmark => {
    const div = document.createElement('div');
    div.className = 'bookmark-item';
    div.innerHTML = `
      <img src="${bookmark.image || 'https://via.placeholder.com/100'}" alt="${bookmark.title}">
      <span>${bookmark.title}</span>
    `;
    div.onclick = () => openModal(bookmark); // Open modal with bookmark details
    list.appendChild(div);
  });
}


function downloadSampleTree() {
  // Replace this URL with your actual server file URL
  const url = 'sample-tree.json';

  // Debugging step: log the URL
  console.log('Attempting to download file from:', url);

  // Use fetch to ensure the file is accessible before initiating the download
  fetch(url, { method: 'HEAD' })
    .then(response => {
      if (response.ok) {
        // File is accessible, proceed with download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample-tree.json'; // Name the file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // File not found or server error
        alert('Failed to download file. Please try again later.');
        console.error('File could not be accessed:', response.status, response.statusText);
      }
    })
    .catch(error => {
      // Handle network or CORS issues
      alert('Failed to download file due to a network or server error.');
      console.error('Error while attempting to download file:', error);
    });
}

function showContextMenu(event, bookmark) {
  // Remove any existing context menu
  const existingMenu = document.getElementById('bookmarkContextMenu');
  if (existingMenu) existingMenu.remove();

  // Create the context menu
  const menu = document.createElement('div');
  menu.id = 'bookmarkContextMenu';
  menu.style.position = 'absolute';
  menu.style.top = `${event.clientY}px`;
  menu.style.left = `${event.clientX}px`;
  menu.style.backgroundColor = '#ffffff';
  menu.style.border = '1px solid #ccc';
  menu.style.padding = '5px';
  menu.style.zIndex = 1000;

  // Add "Edit" option
  const editOption = document.createElement('div');
  editOption.innerText = 'Edit';
  editOption.style.cursor = 'pointer';
  editOption.onclick = () => {
    openModal(bookmark); // Open the edit popup
    menu.remove(); // Remove the context menu
  };

  menu.appendChild(editOption);
  document.body.appendChild(menu);

  // Remove menu when clicking elsewhere
  document.addEventListener('click', () => {
    menu.remove();
  }, { once: true });
}

function openBookmarkUrl(url) {
  if (url) {
    // Ensure the URL starts with "https://"
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    window.open(url, '_blank'); // Open the URL in a new tab or window
  }
}

//this will enable tree to drag and drop bookmarks
$('#folderTree').on('ready.jstree', function () {
  $('#folderTree').jstree(true).settings.core.check_callback = true;
});

// Add dragover and drop event handlers to the folder tree
$('#folderTree').on('dragover', function (event) {
  event.preventDefault();
  event.originalEvent.dataTransfer.dropEffect = 'move';
});

$('#folderTree').on('drop', function (event) {
  event.preventDefault();
  
  const data = event.originalEvent.dataTransfer.getData('text/plain');
  const bookmark = JSON.parse(data);

  // Get the folder ID where the bookmark was dropped
  const targetFolderId = $(event.target).closest('li').attr('id');

  // Validate: Ensure the bookmark is not dropped in the same folder
  if (bookmark.folderId === targetFolderId) {
    alert('Bookmark is already in this folder.');
    return;
  }

  // Update the folderId for the bookmark
  bookmark.folderId = targetFolderId;

  // Update the bookmarks array
  const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmark.id);
  if (bookmarkIndex !== -1) {
    bookmarks[bookmarkIndex].folderId = targetFolderId;
  }

  // Refresh the bookmark list and folder tree
  displayBookmarks();
  
  //$('#folderTree').jstree(true).refresh();
});


$('#folderTree')
  .on('dragover', 'li', function (event) {
    event.preventDefault();
    $(this).addClass('drop-target'); // Highlight the folder as a drop target
  })
  .on('dragenter', 'li', function () {
    $(this).addClass('drop-target'); // Highlight the folder
  })
  .on('dragleave', 'li', function () {
    $(this).removeClass('drop-target'); // Remove highlight
  })
  


  