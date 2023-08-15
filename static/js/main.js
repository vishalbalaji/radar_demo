const canvas = document.getElementById("canvas");
const canvas1 = document.getElementById("canvas1");
const img = document.getElementById("orig-img");
const procImg = document.getElementById("processed-img");
let src_img;
let originalHeight = null;
let originalWidth = null;
let original_height;
let isDown = false;
let startX;
let startY;
let scrollLeft;
let scrollTop;
let defaultBrightness = 100;
let defaultContrast = 100;
let processEnabled = true;
let imgProcessed = false;

function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      $("#src-img").attr("src", e.target.result);

      src_img = document.getElementById("src-img");
      $("#dst-img").attr("src", e.target.result);
      $("#orig-img").attr("src", e.target.result);
      $("#processed-img").attr("src", "");
      $("#dst-img").css("opacity", "0");
      $("#info-panel").css("display", "block");
      $("#defect-info-wrapper").css("display", "none");
      $("#info").css("visibility", "visible");
      var table = document.getElementById("defect-table");
      for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
      }
      document.getElementById("process-button").classList.remove("disabled");
      document.getElementById("reset-button").classList.remove("disabled");
      processEnabled = true;
      imgProcessed = false;
    };
    reader.readAsDataURL(input.files[0]);
    $("#filename").html(input.files[0].name);
  }
}
$("#upload-file").change(function() {
  $("#upload-spinner").css("opacity", "1");
  readURL(this);
  originalHeight = null;
  originalWidth = null;
  $("#upload-spinner").css("opacity", "0");
});

$("#process-button").click(function() {
  if (processEnabled && !imgProcessed && $("#src-img").attr("src") != "") {
    $("#process-spinner").css("opacity", "1");
    var table = document.getElementById("defect-table");
    for (var i = table.rows.length - 1; i > 0; i--) {
      table.deleteRow(i);
    }
    let form = new FormData($("#image-upload")[0]);
    console.log("sending file");

    let peneData = new FormData($("#pene-form")[0]);
    for (var pair of peneData.entries()) {
      form.append(pair[0], pair[1]);
    }

    let weldData = new FormData($("#weld-form")[0]);
    for (var pair of weldData.entries()) {
      form.append(pair[0], pair[1]);
    }

    for (var pair of form.entries()) {
      console.log(pair[0], pair[1]);
    }

    let index = 1;
    document.getElementById("upload-file").disabled = true;
    document.getElementById("load-button").classList.add("disabled");
    document.getElementById("process-button").classList.add("disabled");
    document.getElementById("reset-button").classList.add("disabled");
    processEnabled = false;
    $.ajax({
      url: $("image-upload").attr("action"),
      type: "POST",
      data: form,
      cache: false,
      contentType: false,
      processData: false,
      success: function(response) {
        let length = Object.keys(response).length;
        $("#process-spinner").css("opacity", "0");
        document.getElementById("upload-file").disabled = false;
        document.getElementById("load-button").classList.remove("disabled");
        document.getElementById("reset-button").classList.remove("disabled");
        processEnabled = true;
        imgProcessed = true;
        console.log(response.faulty);

        if (response.success) {
          $("#dst-img").css("opacity", "1");
          $("#defect-description").css("color", "black");
          if (response.faulty) {
            $("#dst-img").attr("src", response.img_path);
            $("#processed-img").attr("src", response.img_path);
            $("#linear").html(response.linear);
            $("#rounded").html(response.rounded);
            $("#direction").html(response.direction);
            $("#linear-wrapper").css("display", "flex");
            $("#rounded-wrapper").css("display", "flex");
            $("#direction-wrapper").css("display", "flex");
            $("#defect-table-wrapper").css("display", "block");
            $("#defect-description").html(response.printval);
            $("#defect-info-wrapper").css("display", "block");
            $("#defect-info-wrapper").css("width", "100%");
            for (var fault_index in response.faults) {
              let row = document.getElementById("defect-table").insertRow();
              let cell1 = row.insertCell();
              let cell2 = row.insertCell();
              cell1.innerHTML = String(index);
              index++;
              cell2.innerHTML = response.faults[fault_index].fault_length;
            }
          } else {
            $("#fault-description-wrapper").css("display", "block");
            $("#defect-description").html(response.printval);
            $("#defect-info-wrapper").css("display", "block");
            $("#linear-wrapper").css("display", "none");
            $("#rounded-wrapper").css("display", "none");
            $("#direction-wrapper").css("display", "none");
            $("#defect-table-wrapper").css("display", "none");
            $("#processed-img").attr("src", img.src);
          }
        } else {
          console.log("Failure");
          $("#fault-description-wrapper").css("display", "block");
          $("#defect-info-wrapper").css("display", "block");
          $("#defect-description").html(
            "ERROR: Could not process image. Please try a different one."
          );
          $("#defect-description").css("color", "red");
          $("#rounded-wrapper").css("display", "none");
          $("#linear-wrapper").css("display", "none");
          $("#direction-wrapper").css("display", "none");
          $("#defect-table-wrapper").css("display", "none");
        }
      }
    });
  }
});

$("#reset-button").click(function() {
	if (document.getElementById("reset-button").classList.contains("disabled")) return;
  document.getElementById("process-button").classList.remove("disabled");
  document.getElementById("reset-button").classList.add("disabled");
  document.getElementById("src-img").src = "";
  document.getElementById("dst-img").src = "";
  document.getElementById("info").style.visibility = "hidden";
  imgProcessed = false;
});

canvas.addEventListener("mousedown", e => {
  isDown = true;
  startX = e.pageX - canvas.offsetLeft;
  startY = e.pageY - canvas.offsetTop;
  scrollLeft = canvas.scrollLeft;
  scrollTop = canvas.scrollTop;
  img.style.cursor = "grabbing";
});

canvas.addEventListener("mouseleave", () => {
  isDown = false;
});

canvas.addEventListener("mouseup", () => {
  isDown = false;
  img.style.cursor = "grab";
});

canvas.addEventListener("mousemove", e => {
  if (!isDown) return;
  if (img.height > originalHeight) {
    event.preventDefault();
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;
    let style = window.getComputedStyle(canvas);
    const walkX = scrollLeft - (x - startX);
    const walkY = scrollTop - (y - startY);
    canvas.scrollLeft = walkX;
    canvas.scrollTop = walkY;
    canvas1.scrollLeft = walkX;
    canvas1.scrollTop = walkY;
  }
});

canvas.addEventListener("wheel", function(e) {
  console.log(originalHeight, originalWidth);
  if (e.deltaY < 0) {
    if (img.height > img.width) {
      img.style.height = String(img.height + 50) + "px";
      img.style.width = "unset";
      procImg.style.height = String(procImg.height + 50) + "px";
      procImg.style.width = "unset";
    } else {
      img.style.width = String(img.width + 50) + "px";
      img.style.height = "unset";
      procImg.style.width = String(procImg.width + 50) + "px";
      procImg.style.height = "unset";
    }
  } else {
    if (img.height <= originalHeight || img.width <= originalWidth) {
      if (img.height > img.width) {
        img.style.height = "100%";
        img.style.width = "unset";
        procImg.style.height = "100%";
        procImg.style.width = "unset";
      } else {
        img.style.width = "100%";
        img.style.height = "unset";
        procImg.style.width = "100%";
        procImg.style.height = "unset";
      }
      canvas.scrollLeft = 0;
      canvas.scrollTop = 0;
      canvas1.scrollLeft = 0;
      canvas1.scrollTop = 0;
      console.log("set");
    } else {
      if (img.height > img.width) {
        img.style.height = String(img.height - 50) + "px";
        img.style.width = "unset";
        procImg.style.height = String(procImg.height - 50) + "px";
        procImg.style.width = "unset";
      } else {
        img.style.width = String(img.width - 50) + "px";
        img.style.height = "unset";
        procImg.style.width = String(procImg.width - 50) + "px";
        procImg.style.height = "unset";
      }
    }
  }
  img.style.maxHeight = "unset";
  img.style.maxWidth = "unset";
  procImg.style.maxHeight = "unset";
  procImg.style.maxWidth = "unset";
  //   console.log(originalHeight);
});

$("#edit-button").click(function() {
  console.log("edit");
  $("#bg-modal").css("visibility", "visible");
  if (originalHeight == null && originalWidth == null) {
    if (src_img.height > src_img.width) {
      img.style.height = "100%";
      img.style.width = "unset";
      procImg.style.height = "100%";
      procImg.style.width = "unset";
    } else {
      img.style.width = "100%";
      img.style.height = "unset";
      procImg.style.width = "100%";
      procImg.style.height = "unset";
    }
    originalHeight = img.height;
    originalWidth = img.width;
    console.log(originalHeight, originalWidth);
  }
});

$("#exit-button").click(function() {
  console.log("edit");
  $("#bg-modal").css("visibility", "hidden");
});

$("#default-button").click(function() {
  if (img.height > img.width) {
    img.style.height = "100%";
    img.style.width = "unset";
    procImg.style.height = "100%";
    procImg.style.width = "unset";
  } else {
    img.style.width = "100%";
    img.style.height = "unset";
    procImg.style.width = "100%";
    procImg.style.height = "unset";
  }
  canvas.scrollLeft = 0;
  canvas.scrollTop = 0;
  canvas1.scrollLeft = 0;
  canvas1.scrollTop = 0;
});

$("#plus-brightness").click(function(e) {
  e.preventDefault();
  defaultBrightness += 20;
  string = `brightness(${defaultBrightness}%) contrast(${defaultContrast}%)`;
  img.style.filter = string;
  procImg.style.filter = string;
});

$("#minus-brightness").click(function(e) {
  e.preventDefault();
  defaultBrightness -= 20;
  string = `brightness(${defaultBrightness}%) contrast(${defaultContrast}%)`;
  img.style.filter = string;
  procImg.style.filter = string;
});

$("#default-brightness").click(function(e) {
  e.preventDefault();
  defaultBrightness = 100;
  string = `brightness(${defaultBrightness}%) contrast(${defaultContrast}%)`;
  img.style.filter = string;
  procImg.style.filter = string;
});

$("#plus-contrast").click(function(e) {
  e.preventDefault();
  defaultContrast += 10;
  string = `brightness(${defaultBrightness}%) contrast(${defaultContrast}%)`;
  img.style.filter = string;
  procImg.style.filter = string;
});

$("#minus-contrast").click(function(e) {
  e.preventDefault();
  defaultContrast -= 10;
  string = `brightness(${defaultBrightness}%) contrast(${defaultContrast}%)`;
  img.style.filter = string;
  procImg.style.filter = string;
});

$("#default-contrast").click(function(e) {
  e.preventDefault();
  defaultContrast = 100;
  string = `brightness(${defaultBrightness}%) contrast(${defaultContrast}%)`;
  img.style.filter = string;
  procImg.style.filter = string;
});
