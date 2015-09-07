function carousel(elm) {
    this.container = elm.container;
    this.list = elm.list;
    this.img = this.list.children();
    this.buttons = elm.buttons;
    this.aTime = elm.animateTime;
    this.interval = elm.interval;

    this.init();
    this.bindEvent();
}
carousel.prototype.init = function() {
    var html = [];

    //根据屏幕宽度设置容器和图片的宽高
    this.scaleW = $(window).width();
    this.container.width(this.scaleW - 6);
    this.img.width(this.scaleW);
    this.list.width(this.scaleW * (this.img.length));

    //设定初始的索引值
    this.index = 0;

    //画button
    for (var i = 0; i < this.img.length - 2; i++) {
        html += "<span index=" + i + "></span>";
    }
    this.buttons.append(html);
    this.button = this.buttons.children();
    this.button.eq(0).addClass('PRRButtonsOn');

    //画按钮
    this.buttons.after("<a href='javascript:;' class='arrow prev'>&lt;</a><a href='javascript:;' class='arrow next'>&gt;</a>");

}
carousel.prototype.bindEvent = function() {
    var self = this;
    var scaleW = self.scaleW;
    var imgArrLength = self.img.length;
    var prev = $('.prev');
    var next = $('.next');
    var animate = false,
        turn = 0;
    autoRun();

    //设定初始位置
    setTransform(-scaleW);

    //改变按钮方法
    function showButton() {
        self.button.eq(self.index).addClass('PRRButtonsOn').siblings().removeClass('PRRButtonsOn');
    }

    //获取当前位置transform值
    function getTransform() {
        var str1 = self.list.css("transform");
        str1 = str1.replace("matrix(", "");
        str1 = str1.replace(")", "");
        var arr1 = str1.split(",");
        return arr1[4] * 1;
    };

    //设置滑动距离
    function setTransform(value) {
        self.list.css("-webkit-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("-moz-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("-o-transform", "translate3d(" + value + "px,0,0)");
        self.list.css("transform", "translate3d(" + value + "px,0,0)");
    };

    //设置动画效果
    function setTransition(value) {
        self.list.css("-webkit-transition", "-webkit-transform " + value + "s ease-out");
        self.list.css("-moz-transition", "-webkit-transform " + value + "s ease-out");
        self.list.css("-o-transition", "-webkit-transform " + value + "s ease-out");
        self.list.css("transition", "-webkit-transform " + value + "s ease-out");
    }

    //滑动主事件
    function sliderAnimate(Trf, act) {

        animate = true;
        setTransition(self.aTime);
        if (act == 1) {

            //左翻
            setTransform(Trf + scaleW);
            if (self.index == 0) {
                self.index = imgArrLength - 3;
                turn = -1;
            } else {
                self.index -= 1;
                turn = 0;
            }
            showButton();
        };
        if (act == -1) {

            //右翻
            setTransform(Trf - scaleW);
            if (self.index == imgArrLength - 3) {
                self.index = 0;
                turn = 1;
            } else {
                self.index += 1;
                turn = 0;
            }
             showButton();
        };
    }

    prev.on('click', function() {
        if (!animate) {

            //获取当前的容器transform值
            self.startTrf = -(self.index + 1) * scaleW;

        sliderAnimate(self.startTrf, 1);
        } else {
            return;
        }
    });

    next.on('click', function() {
        if (!animate) {

            //获取当前容器transform值
            self.startTrf = -(self.index + 1) * scaleW;

            sliderAnimate(self.startTrf, -1);
        } else {
            return;
        }
    });


    self.button.each(function() {
        $(this).bind('click', function() {
            console.log(1);
            if ($(this).attr('class') == 'PRRButtonsOn') {
                return;
            }
            var myIndex = parseInt($(this).attr('index'));
            var offset = -scaleW * (myIndex + 1); //图片应该移动的距离
            setTransition(self.aTime);
            setTransform(offset);
            self.index = myIndex;
            showButton();
        })
    })

    //自动播放
    function autoRun() {
        timer = setTimeout(function() {
            next.trigger('click');
            autoRun();
        }, self.interval);
    }

    function stopAuto() {
        clearTimeout(timer);
    }

    self.container.hover(stopAuto, autoRun);

    //监听动画结束
    self.list.on('transitionend webkitTransitionEnd', function() {

        var value = scaleW * (imgArrLength - 3);
        animate = false;
        setTransition(0);
        if (turn == -1) {
            setTransform(self.startTrf - value);
        };
        if (turn == 1) {
            setTransform(self.startTrf + value);
        };
    });
}