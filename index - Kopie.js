const fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener('change', (event) => {
    if (window.FileList && window.File && window.FileReader) {
        document.getElementById('file-selector').addEventListener('change', event => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', event => {
                //console.log('Inhalt:', event.target.result );
                let newLink = document.createElement("a");
                const textToBLOB = new Blob([event.target.result], { type: 'text/plain' });
                const sFileName = 'formData.txt';
                newLink.download = sFileName;


                if (window.webkitURL != null) {
                    newLink.href = window.webkitURL.createObjectURL(textToBLOB);
                }
                else {
                    newLink.href = window.URL.createObjectURL(textToBLOB);
                    newLink.style.display = "none";
                    document.body.appendChild(newLink);
                }
        
                newLink.click(); 

            });
            reader.readAsText(file);
        });
    };
});