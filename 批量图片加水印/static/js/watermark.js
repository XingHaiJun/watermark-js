let fileList ={};//初始fileList 浏览器设置不可修改
let curFiles = [];//存储文件
let imgIndex = 0;//多图片下标
let imgNumber = 0;//多图片长度
let imgState = 0;//生成状态：0完成，1生成中
function getImg(e) {//图片预览
    $('.upload-box .ico1').hide()
    $('#upList .ico2').remove()
    fileList = e;
    for (let i = 0; i < fileList.length; i++) {
        let url = getObjectURL(fileList[i])
        let div = document.createElement('div');
        div.className = 'img-box';
        div.setAttribute('id', fileList[i].name);
        div.innerHTML = `<img class="imgitem" id="cansImg${i}" src="${url}" alt=""><span onclick="deleteImg(this)">X</span>`;
        document.getElementById('upList').appendChild(div)
    } 
    //创建新增按钮
    let label = document.createElement('label');
    label.className = 'ico2';
    label.setAttribute('for', 'upLoad');
    label.innerText = '+';
    document.getElementById('upList').appendChild(label)
    $('#upList .img-box').show()//创建所有图片，统一显示，减少回流
    $('#upList .ico2').show()
    Array.prototype.push.apply(curFiles, fileList);
}
function getObjectURL(file) {//file 转 Blob
    var url = null ;
    if (window.createObjectURL!=undefined) { // basic
        url = window.createObjectURL(file) ;
    } else if (window.URL!=undefined) { // mozilla(firefox)
        url = window.URL.createObjectURL(file) ;
    } else if (window.webkitURL!=undefined) { // webkit or chrome
        url = window.webkitURL.createObjectURL(file) ;
    }
    return url ;
}
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
function deleteImg(e) {//删除
    let id =  e.parentNode.getAttribute('id');
    for(let i = 0; i < curFiles.length; i++){
        if(curFiles[i].name == id){
            curFiles.splice(i,1)
            break;
        }
    }
    e.parentNode.remove()
}

function createDownImg(obj){//下载水印图片
    let url = obj
    let div = document.createElement('div');
    div.className = 'img-box';
    div.innerHTML = `<img class="imgitem"  src="${url}" alt="">`;
    document.getElementById('downLoad').appendChild(div)
    $('#downLoad .img-box').show()//创建所有图片，统一显示，减少回流
    //创建成功开始下一张
    imgNumber -= 1
    imgIndex += 1;
    imgState = 0
}
function eachDrawingWatermark(){//遍历生成多图片水印
    imgNumber = curFiles.length;
    let text = document.getElementById('contentText').value
    if(imgNumber == 0){alert('请上传图片');return}
    if(text == ''){alert('请输入文字');return}
    let setTime =  setInterval(() => {
        console.log(imgNumber)
        if(imgNumber == 0){
            clearInterval(setTime)    
        }else{
            if(imgState == 1){
                console.log('正在生成'+imgIndex)                
            }else{
                    
                drawingImg()
            }
        }
        
    },1000);
}
function drawingWatermark(height,width){//水印
    let result = [];
    let widthIndex = 0;
    let heightIndex = 0;
    for(let i=0;i<width/50;i++){
        
        for(let k=0;k<height/50;k++){
            let value = {}
            value.x = widthIndex;
            value.y = heightIndex;
            result.push(value)
            heightIndex += 100               
        }
        widthIndex += 200
        heightIndex = 0;
    }
    // console.log(result)
    return result
}

function drawingImg (){//合成水印图片
    imgState = 1 //表示当前水印生成中
    let beginImg = imgIndex;
    let textIn = document.getElementById('contentText').value
    let uploadImg = document.getElementById('cansImg'+beginImg);
    if(uploadImg.complete){
        let imgSize = document.getElementById('imgSize');
        document.getElementById('imgSize').src = uploadImg.src
        let height = 0;
        let width = 0;
        imgSize.onload=()=>{
            //根据上传图片大小定义画布大小         
            height = document.getElementById('imgSize').offsetHeight;
            width = document.getElementById('imgSize').offsetWidth;
            let canvans = document.getElementById("myCanvas");
            canvans.setAttribute('height',height+'px');
            canvans.setAttribute('width',width+'px');
            let ctx=canvans.getContext("2d")
            ctx.drawImage(uploadImg,0,0)
            ctx.font="40px microsoft yahei";
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            let resultText = drawingWatermark(height,width);
            resultText.forEach(function(value) {
                ctx.fillText(textIn,  value.x, value.y);
            });
            let base64Url = canvans.toDataURL("image/jpeg", 1);
            createDownImg(base64Url)
        }
    }
        
} 
function upLoadFile(){//上传图片    
    let content = document.getElementById('contentText').value
    if(content == ''){
        alert('请输入内容')
        return
    }
    if(curFiles.length == 0){
        alert('请选中图片')
        return
    }
    let MyForm = new FormData();
    for(let i=0;i<curFiles.length;i++){
        MyForm.append('files[]', curFiles[i]);
    }
    MyForm.append('content',content);
    $.ajax({
        url:'',
        type:'POST',
        data:MyForm,
        cache:false,
        processData:false,
        contentType:false,
        success(data){
            console.log(data)
        },
        error: function(e){
            console.log(e)
        }
    })
}