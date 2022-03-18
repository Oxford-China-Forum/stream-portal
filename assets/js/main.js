const DATA_LOCATION = 'data.json';
const NUM_PANELS_DISPLAYED = 2;

let platforms = {};

const panels = document.querySelector('#panels');
const panelTemplate = document.querySelector('#panel');
const linkTemplate = document.querySelector('#link');


// function formatTime(timestamp) {
//     const date = new Date(timestamp);
//     const options = {
//         month: 'numeric', day: 'numeric',
//         hour: '2-digit', minute: '2-digit'}
//     return date.toLocaleDateString('zh-CN', );
// }


function makePanel(data, index) {
    const panelElement = panelTemplate.content.cloneNode(true);

    // set names
    const nameChinese = panelElement.querySelector('.panel-name-cn');
    const nameEnglish = panelElement.querySelector('.panel-name-en');
    nameChinese.innerText = data.nameChinese;
    nameEnglish.innerText = data.nameEnglish;

    // set time
    const time = panelElement.querySelector('.panel-time');
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const now = new Date();
    if (startTime < now && now < endTime) {
        time.innerText = '正在直播 Live';
        time.classList.add('live');
    } else {
        const startString = startTime.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const endString = endTime.toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            hour: '2-digit', minute: '2-digit'
        });
        time.innerText = `即将开始：北京时间 ${startString} – ${endString}`;
    }

    // add links
    const links = panelElement.querySelector('.panel-links');
    for (const linkData of data.links) {
        const link = makeLink(linkData);
        links.appendChild(link);
    }

    return panelElement;
}

function makeLink(linkData) {
    const linkElement = linkTemplate.content.cloneNode(true);

    const linkName = linkElement.querySelector('.link-name');
    const linkLogo = linkElement.querySelector('.link-logo');
    const linkQR = linkElement.querySelector('.link-qr');
    const linkLink = linkElement.querySelector('.link-link');
    const linkHint = linkElement.querySelector('.link-hint')
    const platform = platforms[linkData.platform];

    if (platform.logo) {
        linkLogo.title = platform.name;
        linkLogo.src = platform.logo;
    }
    if (platform.name) {
        linkName.innerText = platform.name;
    }

    if (platform.showName) {
        // show both name & logo
    } else if (platform.logo) {
        // show logo, hide name
        linkName.classList.add('d-none');
    } else {
        // show name, hide logo
        linkLogo.classList.add('d-none');
    }

    if (linkData.link) {
        linkLink.href = linkData.link;
        linkHint.classList.add('btn-link');
    } else if (linkData.qr) {
        linkHint.innerText = "扫码进入";
    } else {
        linkHint.classList.add('d-none');
    }

    if (linkData.qr) {
        linkQRImage = new Image();
        linkQRImage.src = linkData.qr;
        linkQR.appendChild(linkQRImage);
    } else if (linkData.link) {
        linkQR.innerHTML = new QRCode({
            content: linkData.link,
            padding: 0,
            background: 'transparent',
            join: true,
            container: 'svg-viewbox'
        }).svg();
        // console.log('qrcode size: ' + linkQR.innerHTML.length);
    }

    return linkElement;
}


function fetchData() {
    fetch(DATA_LOCATION + `?_=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            // update platform data
            platforms = data.platforms

            // take the most recent panels
            const now = new Date();
            const recentPanels = data.panels
                .filter(panelData => new Date(panelData.endTime) >= now)
                .slice(0, NUM_PANELS_DISPLAYED)
                .map(makePanel);

            // add to panels page
            while (panels.firstChild)
                panels.removeChild(panels.lastChild);
            recentPanels.forEach((panel, index) => panels.appendChild(panel, index));
        })
        .catch(console.error);
}


fetchData();
const fetchInterval = setInterval(fetchData, 10000);
const stop = () => clearInterval(fetchInterval);
