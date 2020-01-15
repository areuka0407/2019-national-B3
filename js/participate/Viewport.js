/**
 * Viewport  비디오가 보이는 영역을 담당한다.
 * 클립 등장 유무 및 비디오 조작을 맡는다.
 */

class Viewport {
    constructor(app){
        // App을 전달 받아서 속성으로 저장 (다른 method에서 사용하기 위함)
        this.app = app; 
        this.tempClip = null; // 임시 저장 클립

        /**
         * Viewport에서 필요한 DOM 저장
         */
        this.$root = _("#viewport"); // root: 이 클래스가 관리하는 최상단 DOM
        this.width = this.$root.offsetWidth;
        this.height = this.$root.offsetHeight;

        this.$current_time = _("#play-time .current-time");
        this.$duration = _("#play-time .duration");

        /**
         * 트랙 설정
         */
        this.trackIndex = null; // 현재 재생하려는 트랙의 인덱스
        this.trackList = [      // 5개의 영화에 각각 'Track'이라는 클래스를 생성한다.
            new Track(app, 1),
            new Track(app, 2),
            new Track(app, 3),
            new Track(app, 4),
            new Track(app, 5)
        ];
        this.trackList.forEach(x => {
            x.width = this.width;
            x.height = this.height;
        })
        

        // 마우스 이벤트
        this.mouseEvent();

        // frame 단위로 반복되는 함수
        this.frame();
    }

    /**
     * 현재 재생중인 트랙에 
     */
    get currentTrack(){
        return this.trackIndex === null ? null : this.trackList[this.trackIndex];
    }
    get $video(){
        return this.trackIndex === null ? null : this.trackList[this.trackIndex].$video;
    }
    

    /**
     * 재생할 트랙을 설정한다.
     */
    setTrack(idx){
        if(this.currentTrack) this.$video.remove();

        this.trackIndex = idx;
        this.$video.currentTime = 0;
        this.$root.append(this.$video);
    }

    /**
     * 마우스 이벤트
     */
    mouseEvent(){
        // 새로운 클립을 생성할 때 (곡선, 사각형, 텍스트)
        this.$root.addEventListener("mousedown", e => {
            if(e.which !== 1 || this.app.tool === null || this.tempClip || this.app.select) return;
            this.$video.pause();
            this.tempClip = this.app.tool();
            this.currentTrack.addClip(this.tempClip);
            this.tempClip.mousedown && this.tempClip.mousedown(e);
        });

        window.addEventListener("mousemove", e => {
            if(e.which !== 1 || this.app.tool === null || !this.tempClip || this.app.select) return;
            this.tempClip.mousemove && this.tempClip.mousemove(e);
        });

        window.addEventListener("mouseup", e => {
            if(e.which !== 1 || this.app.tool === null || !this.tempClip || this.app.select) return;
            this.tempClip.mouseup && this.tempClip.mouseup(e);
        });


        // 클립을 선택할 때
        this.$root.addEventListener("mousedown", e => {
            if(e.which !== 1 || !this.app.select || this.tempClip) return false;

            const {clipList} = this.currentTrack;
            clipList.reverse(); // 최근에 삽입한 것부터 선택을 해야하기 때문에 반전시켜야 한다.

            // 모든 클립의 선택을 해제후 다시 그린다.
            clipList.forEach(x => { 
                x.setSelect(false); 
                x.clear();
                x.render(); 
            }); 

            this.tempClip = clipList.find(x => x.check(e)); // 0부터 시작해서 check가 먼저 뜨는 것을 가져온다.

            
            // 선택된 아이템이 있으면 활성화 후 다시 그린다.
            if(this.tempClip) { 
                const {$canvas} = this.tempClip;
                this.tempClip.fx = e.offsetX - $canvas.offsetLeft;
                this.tempClip.fy = e.offsetY - $canvas.offsetTop;

                this.tempClip.setSelect(true); 
                this.tempClip.clear();
                this.tempClip.render();
            }

            clipList.reverse();
        });

        window.addEventListener("mousemove", e => {
            if(e.which !== 1 || !this.app.select || !this.tempClip) return false;
            const {fx, fy} = this.tempClip;
            const [X, Y] = this.tempClip.takeXY(e);
            const style = this.tempClip.$canvas.style;
            style.left = X - fx + "px";
            style.top = Y - fy + "px";
        });
        window.addEventListener("mouseup", e => {
            if(e.which !== 1 || !this.app.select || !this.tempClip) return false;
            this.tempClip = null;
        });
    }

    unset(){
        this.tempClip = null;
    }


    /**
     * rendering frame마다 반복되는 함수
     */
    frame(){
        // video가 재생이 가능할 때만 실행한다. (video 태그에 duration이 활성화 됨 => 현재 재생이 가능함)
        if(this.currentTrack && this.$video.duration){
            const {$video} = this.currentTrack;
            this.$current_time = $video.currentTime.toTimeString();
            this.currentTrack.updateCursor();
            this.render(); 
        }
        requestAnimationFrame(() => { this.frame() });
    }

    /**
     * 화면 내 클립을 제어하는 함수
     */
    render(){
        const {clipList} = this.currentTrack;
        const {currentTime} = this.$video;

        // 현재 보여지고 있는 캔버스를 배열로 만든다.
        const showing = Array.from(this.$root.querySelectorAll("canvas"));
        
        clipList.forEach((clip, i) => {
            clip.$canvas.style.zIndex = i;

            // 보여져야 할 것
            if(clip.startTime <= currentTime && currentTime <= clip.endTime){
                if(!showing.includes(clip.$canvas)){ // 캔버스 배열에 해당 클립의 캔버스가 있는 것인지 확인한다.
                    this.$root.append(clip.$canvas); // 없으면 추가한다.
                }
            }
            // 없애야 할 것
            else if(showing.includes(clip.$canvas)) {
                clip.$canvas.remove();
            }
        });
    }
}