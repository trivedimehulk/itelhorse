export function displayFileContent(file, mainPlayArea) {
    mainPlayArea.innerHTML = ""; // Clear previous content
    const title = document.createElement("h3");
    title.textContent = file.name;

    if (file.thumbnail) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file.thumbnail);
        img.alt = "Thumbnail";
        img.style.width = "150px";
        img.style.height = "auto";
        img.style.marginBottom = "10px";
        mainPlayArea.appendChild(img);
    }

    const details = document.createElement("p");
    details.textContent = `Tags: ${file.tags.join(", ")}\nURL: ${file.url}`;
    mainPlayArea.appendChild(title);
    mainPlayArea.appendChild(details);
}
