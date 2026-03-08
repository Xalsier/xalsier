document.addEventListener("DOMContentLoaded", () => {

    const select = document.getElementById("chapterSelect");
    const container = document.getElementById("profileMarkdown");

    function renderMarkdown(src) {
        fetch(src)
            .then(res => {
                if (!res.ok) throw new Error("Markdown load failed");
                return res.text();
            })
            .then(md => {

                container.innerHTML = marked.parse(md);

                const headers = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
                headers.forEach(header => {
                    const text = header.innerText
                        .replace(/[^a-zA-Z0-9- ]/g, "")
                        .toLowerCase()
                        .replace(/ /g, "-");

                    header.id = text;
                });

            })
            .catch(err => {
                console.error(err);
                container.innerHTML =
                    `<p style="color:red;">Error loading chapter.</p>`;
            });
    }

    fetch("./json/rorschach.json")
        .then(res => {
            if (!res.ok) throw new Error("JSON load failed");
            return res.json();
        })
        .then(groups => {

            groups.forEach(group => {

                const optgroup = document.createElement("optgroup");
                optgroup.label = group.label;

                group.options.forEach(opt => {

                    const option = document.createElement("option");
                    option.textContent = opt.label;
                    option.value = opt.src;

                    optgroup.appendChild(option);

                });

                select.appendChild(optgroup);

            });

            // Load first chapter automatically
            if (select.options.length > 0) {
                renderMarkdown(select.options[0].value);
            }

        })
        .catch(err => {
            console.error(err);
        });

    select.addEventListener("change", () => {
        renderMarkdown(select.value);
    });

});