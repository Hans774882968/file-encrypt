(function () {
  const version = '0.1.0';
  const introStr = `欢迎使用本demo v${version} by hans with ❤️`;
  // disableConsoleOutput 后，即使这段代码加在最前面，这句也大概率出不来
  console.log(`%c${introStr}`, 'font-size: 18px;color: green;');
  const style = document.createElement('style');
  const nagClassName = 'this-is-a-nag-949d405b';
  const closeBtnClassName = 'nag-close-btn';
  style.innerText = `
    .${nagClassName} {
      width: 500px;
      height: 100px;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      background-color: white;
      text-align: center;
      line-height: 100px;
    }
    .${nagClassName} > .${closeBtnClassName} {
      position: absolute;
      top: 10px;
      right: 16px;
      line-height: normal;
      font-weight: bold;
      user-select: none;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const div = document.createElement('div');
  div.className = nagClassName;
  div.innerText = introStr;

  const closeBtn = document.createElement('span');
  closeBtn.className = closeBtnClassName;
  closeBtn.innerText = 'X';
  const closeNAG = () => {
    div.style.visibility = 'hidden';
  };
  closeBtn.onclick = closeNAG;
  setTimeout(closeNAG, 5000);

  div.appendChild(closeBtn);
  document.body.appendChild(div);
}());
