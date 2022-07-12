class BrakeBanner {
	constructor(selector) {
		// 初始化一个画布用PIXI
		this.app = new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xffffff
		})
		document.querySelector(selector).appendChild(this.app.view)
		// this上新建一个页面
		this.stage = this.app.stage
		// 这是一个加载器
		this.loader = new PIXI.Loader(); // 这个加载器相当于回怼图片做一个处理 后面生成精灵图片更方面使用
		// 一次性把图片全部加载进去(loader 既可以解析视频和音频 json文件也可以解析)
		this.loader.add("btn.png", 'images/btn.png') // 添加需要加载的图片 key value的形势
		this.loader.add("btn_circle", 'images/btn_circle.png')
		this.loader.add("brake_bike", 'images/brake_bike.png')
		this.loader.add("brake_handlerbar", 'images/brake_handlerbar.png')
		this.loader.add("brake_lever", 'images/brake_lever.png')
		//加载添加的图片
		this.loader.load()
		// 监听加载完成事件
		this.loader.onComplete.add(() => {
			console.log(this.loader)
			// 创建一个精灵 
			this.show()
		})
	}
	show() {
		// 新建一个bike容器
		let { bikeLeverImage } = this.createbike()

		// 新建一个 按键容器
		let actionButton = this.createActionBtn()
		// 创建粒子
		let { start,pause } = this.createl()
		// pointerdown 是兼容移动端和pc的点击事件
		// mousedown鼠标按住
		actionButton.on('mousedown', () => {
			// 刹车旋转角度
			// bikeLeverImage.rotation = Math.PI / 180 * -30
			gsap.to(bikeLeverImage, { duration: 0.6, rotation: Math.PI / 180 * -30 })
		    pause() 
		})
		actionButton.on('mouseup', () => {
			// 刹车旋转角度
			// bikeLeverImage.rotation = Math.PI / 180 * 0
			gsap.to(bikeLeverImage, { duration: 0.6, rotation: Math.PI / 180 * 0 })
            start()
		})
	}
	createl() {
		// 创建粒子
		let particleContainer = new PIXI.Container();
		this.stage.addChild(particleContainer)
		// 修改圆心坐标
		particleContainer.pivot.x = window.innerWidth / 2
		particleContainer.pivot.y = window.innerHeight / 2
		// 旋转粒子容器
		particleContainer.rotation = 30 * Math.PI / 180
		let particles = []
		// 粒子有多个颜色
		let colors = [0xf1cf54, 0xb5cea8, 0xf1cf54, 0x818f54, 0xb5cea8]
		for (let i = 0; i < 10; i++) {
			// PIXI绘制图形的api创建 如果是图片直接加载图片就行了
			let gr = new PIXI.Graphics(); // 相当于canvas的getContext("2d") 就是一个画笔

			// 填充颜色
			// 粒子有多个颜色
			gr.beginFill(colors[Math.floor(Math.random() * colors.length)])
			// 画一个圆
			gr.drawCircle(0, 0, 6)
			// 最后画
			gr.endFill()
			// 把新建的原点和开始坐标压入到particles数组里 粒子移动要用
			let aitem = {
				sx: Math.random() * window.innerWidth,
				sy: Math.random() * window.innerHeight,
				gr: gr,
			}
			// 原点的随机位置
			gr.x = aitem.sx
			gr.y = aitem.sy
			particleContainer.addChild(gr)
			particles.push(aitem)
		}
		let speed = 0
		// 用gsap创建一个循环
		function loop() {
			speed += .5
			Math.min(speed, 20)
			for (let i = 0; i < particles.length; i++) {
				let pItem = particles[i]
				pItem.gr.y += speed
				if (speed>=20) {
					pItem.gr.scale.y = 40
					pItem.gr.scale.x = 0.04
				}
				if (pItem.gr.y > window.innerHeight) pItem.gr.y = 0
			}
		}
		function start() {
			speed = 0
			gsap.ticker.add(loop)
		}
		function pause() {
			gsap.ticker.remove(loop)
			for (let i = 0; i < particles.length; i++) {
				let pItem = particles[i]
				pItem.gr.scale.y = 1
				pItem.gr.scale.x = 1
				gsap.to(pItem.gr,{ duration:1,x: pItem.sx,y: pItem.sy,ease: "elastic" })
			}
		}
		start()
		// 向某一个角度持续移动
		// gsap.ticker.add(loop) // gsap添加了一个监听事件
		// 超出边界后回到顶部继续移动
		// 按住鼠标停止移动
		// 停止有回弹效果
		// 松开鼠标继续

		return {
			start,pause
		}
	}
	createbike() {
		// 新建一个车架容器
		let bikeContainer = new PIXI.Container()
		bikeContainer.scale.x = bikeContainer.scale.y = 0.3
		// 容器加到一个页面里去
		this.stage.addChild(bikeContainer)
		// 可以往新建容器里添加精灵了 (个人感觉 Sprite精灵就是画笔 传的值就是坐标)
		let bikeImage = new PIXI.Sprite(this.loader.resources['brake_bike'].texture)
		// 将画完的图加入到容器或页面里 
		bikeContainer.addChild(bikeImage)
		// 把手
		let bikeLeverImage = new PIXI.Sprite(this.loader.resources['brake_lever'].texture)
		bikeContainer.addChild(bikeLeverImage)
		// 设置圆心点坐标把手的
		bikeLeverImage.pivot.x = 455
		bikeLeverImage.pivot.y = 455
		// bikeLeverImage位置
		bikeLeverImage.x = 722
		bikeLeverImage.y = 900
		// 车把
		let brakeHandlerbar = new PIXI.Sprite(this.loader.resources['brake_handlerbar'].texture)
		bikeContainer.addChild(brakeHandlerbar)

		return { bikeImage, bikeLeverImage, brakeHandlerbar }
	}
	createActionBtn() {
		// 这个这两个图片是一起的 所以应该放到一个容器里 进行统一管理
		let actionButton = new PIXI.Container()
		// 把新建的容器挂到了页面上
		this.stage.addChild(actionButton)
		// texture里是有图片的信息 可以直接画图片的
		let btnImage = new PIXI.Sprite(this.loader.resources['btn.png'].texture)
		// 把图片添加到画布内
		actionButton.addChild(btnImage)
		//  精灵画了一个圆圈 需要把圆圈图片添加到画布上
		let circle = new PIXI.Sprite(this.loader.resources['btn_circle'].texture)
		actionButton.addChild(circle)
		// 这是一个实线圈
		let circle2 = new PIXI.Sprite(this.loader.resources['btn_circle'].texture)
		actionButton.addChild(circle2)
		// 需要修改一下圆心位置 pivot
		btnImage.pivot.x = btnImage.pivot.y = btnImage.width / 2
		circle.pivot.x = circle.pivot.y = circle.width / 2
		circle2.pivot.x = circle2.pivot.y = circle2.width / 2
		// 修改容器的位置
		actionButton.x = actionButton.y = 300
		circle.scale.x = circle.scale.y = 0.8
		// 动画效果用的gsap
		gsap.to(circle.scale, { duration: 1, x: 1.3, y: 1.3, repeat: -1 })  // repeat -1 是无限循环
		gsap.to(circle, { duration: 1, alpha: 0, repeat: -1 })

		//添加可以添加事件的属性
		actionButton.interactive = true
		// 添加鼠标移上去有小手
		actionButton.buttonMode = true
		return actionButton
	}
}