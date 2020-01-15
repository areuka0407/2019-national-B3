//'document.querySelector'를 치기 귀찮아서 만든 함수
function _(selector){
    return document.querySelectorAll(selector).length > 1 ? document.querySelectorAll(selector) : document.querySelector(selector);
}

function offset(target){
    let left = target.offsetLeft;
    let top = target.offsetTop;
    
    let parent = target.offsetParent;
    while(parent != null){
        left = left + parent.offsetLeft;
        top += parent.offsetTop;
        parent = parent.offsetParent;
    }
    return {left: left, top: top};
}


// 시간형 지정 프로토 타입
Number.prototype.toTimeString = function(){
    let integer = parseInt(this);

    let hour = parseInt(integer / 3600);
    let min = parseInt(integer % 3600 / 60);
    let sec = parseInt(integer % 60);

    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;

    let msec = this.toFixed(2).substr(-2, 2);
    
    return `${hour}:${min}:${sec}:${msec}`;
}



/**
 *  App - 하위 클래스를 총괄하는 역할을 한다.
 *  사용자가 하는 설정 (툴이나 크기, 색상 및 영화 선택 등)을 맡는다.
 */

class App {
    constructor(){
        /**
         * App의 설정 프로퍼티
         */

         this.tool = null; // 현재 선택된 타입(ex: 자유곡선, 사각형)을 구분하는 속성

        /**
         * DOM 가져오기 - App에서 이벤트를 줄 일이 있는 DOM만 가져온다.
         *  :: 편의 상 프로퍼티 앞에 '$'를 접두어로 붙인다.
         */

         // 버튼들
         this.$btn_curve = _("#curve-btn");
         this.$btn_rect = _("#rect-btn");
         this.$btn_text = _("#text-btn");
         this.$btn_select = _("#select-btn");
         this.$btn_play = _("#play-btn");
         this.$btn_pause = _("#pause-btn");
         this.$btn_alldel = _("#alldel-btn");
         this.$btn_seldel = _("#seldel-btn");
         this.$btn_download = _("#download-btn");
         this.$btn_reset = _("#reset-btn");
         this.$btn_merge = _("#merge-btn");

         // 콤보 박스
         this.$input_color = _("#color-input");
         this.$input_width = _("#width-input");
         this.$input_fsize = _("#size-input");

         // 클립 영역
         this.$clipWrap = _("#clip-list");

         // 영화 섬네일
         this.$thumbnails = _("#movie-list > img");

         /**
          * 하위 클래스와 연결
          */
         this.viewport = new Viewport(this); // this => 'App' 인스턴스
         

         /**
          * 이벤트 연결
          */

         this.buttonEvent(); // 좌측 버튼 이벤트
         this.imageEvent(); // 하단 이미지 이벤트
    }

    /**
     * Getter로 property를 통해 현재 콤보 박스에 선택된 값을 바로 가져와 반환하도록 한다.
     */
    get color(){ return this.$input_color.value; }
    get fontSize(){ return this.$input_fsize.value; }
    get width(){ return this.$input_width.value; }
    
    setSelect() { this.select = true; }

    setTool(toolName){
        /**
         * this.tool 에 새로운 클립 객체를 '반환'하는 함수를 삽입한다.
         */
        const toolList = {
            "curve": () => new Curve(this),
            "rect": () => new Rect(this),
            "text": () => new Text(this),
        };

        let active = document.querySelector(".tool.active");
        active && active.classList.remove("active");
        document.querySelector(`.tool[data-name='${toolName}']`).classList.add("active");
        
        this.select = false;
        this.tool = toolList[toolName];
    }
    

    /**
     * 이벤트
     */

     // 버튼 이벤트
     buttonEvent(){
         let isPrepared = () => { // this 사용을 위해 arrow function으로 만든다
            if(this.viewport.currentTrack === null) alert("비디오를 선택해 주세요!");
            return this.viewport.currentTrack !== null;
         }
         /**
          * AND 연산자는 FALSE가 나올때 까지 계속 코드를 실행하기 때문에
          * 만약 'isPrepared'함수에서 false가 나오면 이후는 실행되지 않고,
          * true가 나오면 계속 실행한다.
          */
        this.$btn_play.addEventListener("click", () => isPrepared() && this.viewport.$video.play());
        this.$btn_pause.addEventListener("click", () => isPrepared() && this.viewport.$video.pause());

        
        this.$btn_curve.addEventListener("click", () => isPrepared() && this.setTool("curve"));
        this.$btn_rect.addEventListener("click", () => isPrepared() && this.setTool("rect"));
        this.$btn_text.addEventListener("click", () => isPrepared() && this.setTool("text"));

        this.$btn_select.addEventListener("click", e => isPrepared() && (e => {
            let active = document.querySelector(".tool.active");
            active && active.classList.remove("active");
            e.target.classList.add("active");
            this.setSelect();
        })(e));

     }

     // 이미지 이벤트
     imageEvent(){
        this.$thumbnails.forEach((img, idx) => {
            img.addEventListener("click", () => {
                // 뷰 포트에 트랙을 갈아 끼운다
                this.viewport.setTrack(idx);
            
                // 클립 리스트도 갈아 끼운다.
                this.$clipWrap.innerHTML = "";
                this.$clipWrap.append(this.viewport.currentTrack.$clipList); 
            });
        });
     }
}


/**
 * C과제에서 App을 이용해 html 문자열을 받아야 하기 때문에 
 * window property로 할당하여, 어떤 스크립트 코드에서도 사용할 수 있게한다.
 */

window.addEventListener("load", function(){
    this.participate = new App();
});
