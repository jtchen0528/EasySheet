import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
/*
export function generatePDF(id){
    const input = document.getElementById(`${id}`);
    html2canvas(input,{

      x: 0,
      y: 0,
      logging: false,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      useCORS: false,
      allowTaint: false,
      scale: 1,
      useCORS: true,
      dpi: 200,
  })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg');
        console.log(imgData);
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'JPEG', 0, 0,canvas.width,canvas.height);
        // pdf.output('dataurlnewwindow');
        pdf.save("download.pdf");


        saveAs(imgData, 'file-name.png');
      })
    ;
}
*/
function saveAs(uri, filename) {

  var link = document.createElement('a');

  if (typeof link.download === 'string') {

      link.href = uri;
      link.download = filename;

      //Firefox requires the link to be in the body
      document.body.appendChild(link);

      //simulate click
      link.click();

      //remove the link when done
      document.body.removeChild(link);

  } else {

      window.open(uri);

  }
}

export function generatePDFByPdfMaker(id, backgroundColor='white'){
    const input = document.getElementById(`${id}`);
    console.log(input, input.scrollWidth, input.scrollHeight)
    html2canvas(input,{
        x: 55,
        y: 100,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        scale: 1,
        dpi: 400,
    }).then((canvas) => {
        // 邊界
        const margin = 30;
        // setting for pdfMaker
        var docDefinition = {
            pageSize: 'A4',
            pageMargins: [margin / 2, margin / 2, margin / 2, margin / 2],
            content: []
        };
        var ctx = canvas.getContext('2d');
        // 取得canvas大小
        var contentWidth = canvas.width;
        var contentHeight = canvas.height;

        //一页pdf显示html页面生成的canvas高度;
        var pageHeight = contentWidth / 592.28 * 841.89-margin;
        // canvas總高度
        var leftHeight = contentHeight;
        // pdf页面偏移
        var position = 0;

        //單頁中印的圖片大小（a4尺寸[595.28,841.89]）
        var imgWidth = 595.28 -margin;
        var imgHeight = 841.89 -margin;//592.28 / contentWidth * contentHeight -margin*2;
        
        if (leftHeight < pageHeight) {//只需單頁的話
            docDefinition.content.push({ image: canvas.toDataURL('image/jpeg', 1.0) });
        } else {// 需多頁的話
            
            while (leftHeight > 0) {
                var _c = document.createElement('canvas');
                _c.width = imgWidth;
                _c.height = imgHeight;
                var _ctx = _c.getContext('2d');
                // 如果是最後一頁的話需手動著背景色
                if (leftHeight < imgHeight) {
                    _ctx.fillStyle = backgroundColor;
                    _ctx.fillRect(0, 0, imgWidth, imgHeight);
                }
                _ctx.drawImage(canvas, 0, position, imgWidth, Math.min(leftHeight, imgHeight), 0, 0, imgWidth, Math.min(leftHeight, imgHeight));
                
                docDefinition.content.push({ image: _c.toDataURL('image/jpeg', 1.0) });

                leftHeight -= imgHeight;
                position += imgHeight;
            }
        }
        pdfMake.createPdf(docDefinition).open();
    });
}

export function generatePDF(id){
  const input = document.getElementById(`${id}`);
  html2canvas(input,{
    x: 40,
    y: 205.28,
    windowWidth: input.scrollWidth,
    windowHeight: input.scrollHeight,
    scale: 2,
    dpi: 400,
})
    .then((canvas) => {
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;
      console.log(canvas.height)

      //一页pdf显示html页面生成的canvas高度;
      var pageHeight = contentWidth / 592.28 * 841.89;
      //未生成pdf的html页面高度
      var leftHeight = contentHeight;
      //pdf页面偏移
      var position = 0;
      //html页面生成的canvas在pdf中图片的宽高（a4纸的尺寸[595.28,841.89]）
      var imgWidth = 595.28;
      var imgHeight = 592.28 / contentWidth * contentHeight;

      var pageData = canvas.toDataURL('image/jpeg', 1.0);
  //    saveAs(pageData, 'file-name.png');
      var pdf = new jsPDF('', 'pt', 'a4');

      //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
      //当内容未超过pdf一页显示的范围，无需分页
      if (leftHeight < pageHeight) {
          pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
          while (leftHeight > 0) {
              pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
              leftHeight -= pageHeight;
              position -= 841.89;
              //避免添加空白页
              if (leftHeight > 0) {
                  pdf.addPage();
              }
          }
      }
      pdf.save('content.pdf');
    })
  ;
}
/*
export function generatePDF(id){
  const input = document.getElementById(`${id}`);
  html2canvas(input,{
    x: 0,
    y: 0,
    windowWidth: input.scrollWidth,
    windowHeight: input.scrollHeight,
    scale: 2,
    dpi: 200,
})
    .then((canvas) => {
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;

      //一页pdf显示html页面生成的canvas高度;
      var pageHeight = contentWidth / 592.28 * 841.89;
      //未生成pdf的html页面高度
      var leftHeight = contentHeight;
      //pdf页面偏移
      var position = 0;
      //html页面生成的canvas在pdf中图片的宽高（a4纸的尺寸[595.28,841.89]）
      var imgWidth = 595.28;
      var imgHeight = 592.28 / contentWidth * contentHeight;

      var pageData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jsPDF('', 'pt', 'a4');

      //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
      //当内容未超过pdf一页显示的范围，无需分页
      if (leftHeight < pageHeight) {
          pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
          while (leftHeight > 0) {
              pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
              leftHeight -= pageHeight;
              position -= 841.89;
              //避免添加空白页
              if (leftHeight > 0) {
                  pdf.addPage();
              }
          }
      }
      pdf.save('content.pdf');
    })
  ;
}
*/