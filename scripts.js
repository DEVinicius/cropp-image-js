const photoFile = document.getElementById('photo-file')
let photoPreview = document.getElementById("photo-preview")
let image;

// Select and Preview
document.getElementById("select-image").onclick = function(){
    photoFile.click()
}

// Adicionar Evento assim que o DOM for carregado
window.addEventListener('DOMContentLoaded', ()=>{
    photoFile.addEventListener('change', ()=>{
        let file = photoFile.files.item(0)
        // ler um arquivo
        let reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = function(event){
            image = new Image()
            image.src = event.target.result
            image.onload = onLoadImage
        }
    })
})

// Selection tool
const selection = document.getElementById("selection-tool")
let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY
let startSelection = false;
const events = {
    mouseover(){
        this.style.cursor = 'crosshair'
    },
    mousedown(){
        const {clientX, clientY, offsetX, offsetY} = event
        console.table({
            'client': [
                clientX, clientY
            ],
            'offset':[
                offsetX, offsetY
            ]
        })

        startX = clientX
        startY = clientY

        relativeStartX = offsetX
        relativeStartY = offsetY

        startSelection = true
    },
    mousemove(){
        endX = event.clientX
        endY = event.clientY
        if(startSelection)
        {
            selection.style.display = 'initial'
            selection.style.top = startY+"px"
            selection.style.left = startX+"px"
    
            selection.style.width = "360px"
            selection.style.height = "360px"
        }

    },
    mouseup(){
        startSelection = false

        relativeEndX = event.layerX
        relativeEndY = event.layerY

        //mostrar o botao de corte
        cropButton.style.display = 'initial'
    },
}

Object.keys(events).forEach(eventName => {
    photoPreview.addEventListener(eventName, events[eventName])
});


//Canvas

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

function onLoadImage()
{
    const {width, height} = image
    canvas.width = width
    canvas.height = height

    ctx.clearRect(0,0, width, height)

    //desenhar imagem
    ctx.drawImage(image, 0,0)

    photoPreview.src = canvas.toDataURL()
}

//cortar imagem

const cropButton = document.getElementById("crop-image")
cropButton.onclick = function(){
    const {width: imageW, height: imageH} = image
    const {width: previewW, height: previewH} = photoPreview

    //Calculo do fator
    const [widthFactor, heightFactor] = [+(imageW / previewW), +(imageH / previewH)]

    const [selectionWidth, selectionHeight] = [
       +selection.style.width.replace('px', ''),
       +selection.style.height.replace('px', '')
    ]

    const [croppedWidth, croppedHeight] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [actualX, actualY] = [
        +(relativeStartX * widthFactor),
        +(relativeStartY * heightFactor)
    ]

    //pegar do contexto as regioes de corte

    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    
    //limpar o contexto
    ctx.clearRect(0,0, ctx.width, ctx.height)
    
    image.width = canvas.width = croppedWidth
    image.height = canvas.height = croppedHeight
    
    //adicionar imagem cortada 
    ctx.putImageData(croppedImage, 0,0)

    //esconder a ferramenta de seleção
    selection.style.display = 'none'
    
    photoPreview.src = canvas.toDataURL()
}