class Jet_MFD_NDCompass extends Jet_NDCompass {
	constructor() {
		super();
	}

	connectedCallback() {
		super.connectedCallback();
	}

	init() {
		super.init();
	}

	constructArc() {
		super.constructArc();
		this.constructArc_AS01B();
	}

	constructArc_AS01B() {
		this.root = document.createElementNS(Avionics.SVG.NS, 'svg');
		diffAndSetAttribute(this.root, 'width', '100%');
		diffAndSetAttribute(this.root, 'height', '100%');
		diffAndSetAttribute(this.root, 'viewBox', '0 0 1000 710');
		this.appendChild(this.root);
		var trsGroup = document.createElementNS(Avionics.SVG.NS, 'g');
		diffAndSetAttribute(trsGroup, 'transform', 'translate(-45, -100) scale(1.09)');
		this.root.appendChild(trsGroup);
		{
			var circleRadius;
			let viewBox = document.createElementNS(Avionics.SVG.NS, 'svg');
			if (this._fullscreen) {
				diffAndSetAttribute(viewBox, 'viewBox', '-250 -550 600 650');
				circleRadius = 419;
			} else {
				diffAndSetAttribute(viewBox, 'viewBox', '-750 -1200 1400 1400');
				circleRadius = 1100;
			}
			trsGroup.appendChild(viewBox);
			this.arcMaskGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.arcMaskGroup, 'id', 'MaskGroup');
			viewBox.appendChild(this.arcMaskGroup);
			{
				var maskMargin = 10;
				var maskHeight = 200;
				let topMask = document.createElementNS(Avionics.SVG.NS, 'path');
				diffAndSetAttribute(topMask, 'id', 'MaskGroup');
				diffAndSetAttribute(topMask, 'd', 'M' + (-maskMargin) + ' ' + -maskHeight + ', L' + (circleRadius * 2 + maskMargin) + ' ' + -maskHeight + ', L' + (circleRadius * 2 + maskMargin) + ' ' + circleRadius + ', L' + (circleRadius * 2) + ' ' + circleRadius + ', A 25 25 0 1 0 0, ' + circleRadius + ', L' + (-maskMargin) + ' ' + circleRadius + ' Z');
				diffAndSetAttribute(topMask, 'transform', 'translate(' + (50 - circleRadius) + ', ' + (50 - circleRadius) + ')');
				diffAndSetAttribute(topMask, 'fill', 'black');
				this.arcMaskGroup.appendChild(topMask);
			}
			this.arcRangeGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.arcRangeGroup, 'id', 'ArcRangeGroup');
			diffAndSetAttribute(this.arcRangeGroup, 'irs-state', 'off');
			viewBox.appendChild(this.arcRangeGroup);
			{
				let rads = [0.25, 0.50, 0.75];
				for (let r = 0; r < rads.length; r++) {
					let rad = circleRadius * rads[r];
					let path = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(path, 'd', 'M' + (50 - rad) + ',50 a1,1 0 0 1 ' + (rad * 2) + ',0');
					diffAndSetAttribute(path, 'fill', 'none');
					diffAndSetAttribute(path, 'stroke', 'white');
					diffAndSetAttribute(path, 'stroke-width', '2');
					this.arcRangeGroup.appendChild(path);
				}
			}

			this.rotatingCircle = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.rotatingCircle, 'id', 'RotatingCircle');
			viewBox.appendChild(this.rotatingCircle);
			{
				let circleGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(circleGroup, 'id', 'circleGroup');
				{
					let circle = document.createElementNS(Avionics.SVG.NS, 'circle');
					diffAndSetAttribute(circle, 'cx', '50');
					diffAndSetAttribute(circle, 'cy', '50');
					diffAndSetAttribute(circle, 'r', circleRadius + '');
					diffAndSetAttribute(circle, 'fill-opacity', '0');
					diffAndSetAttribute(circle, 'stroke', 'white');
					diffAndSetAttribute(circle, 'stroke-width', '2');
					circleGroup.appendChild(circle);
					let radians = 0;
					let dashSpacing = 72;
					for (let i = 0; i < dashSpacing; i++) {
						let line = document.createElementNS(Avionics.SVG.NS, 'line');
						let bIsBig = (i % 2 == 0) ? true : false;
						let length = (bIsBig) ? 16 : 8.5;
						let lineStart = 50 + circleRadius;
						let lineEnd = lineStart - length;
						let degrees = (radians / Math.PI) * 180;
						diffAndSetAttribute(line, 'x1', '50');
						diffAndSetAttribute(line, 'y1', lineStart + '');
						diffAndSetAttribute(line, 'x2', '50');
						diffAndSetAttribute(line, 'y2', lineEnd + '');
						diffAndSetAttribute(line, 'transform', 'rotate(' + (-degrees + 180) + ' 50 50)');
						diffAndSetAttribute(line, 'stroke', 'white');
						diffAndSetAttribute(line, 'stroke-width', '3');
						if (bIsBig) {
							let text = document.createElementNS(Avionics.SVG.NS, 'text');
							diffAndSetText(text, (i % 3 == 0) ? fastToFixed(degrees / 10, 0) : '');
							diffAndSetAttribute(text, 'irs-state', 'off');
							diffAndSetAttribute(text, 'x', '50');
							diffAndSetAttribute(text, 'y', (-(circleRadius - 50 - length - 18)) + '');
							diffAndSetAttribute(text, 'fill', 'white');
							diffAndSetAttribute(text, 'font-size', (i % 3 == 0) ? '28' : '20');
							diffAndSetAttribute(text, 'font-family', 'Roboto-Bold');
							diffAndSetAttribute(text, 'text-anchor', 'middle');
							diffAndSetAttribute(text, 'alignment-baseline', 'central');
							diffAndSetAttribute(text, 'transform', 'rotate(' + degrees + ' 50 50)');
							circleGroup.appendChild(text);
						}
						radians += (2 * Math.PI) / dashSpacing;
						circleGroup.appendChild(line);
					}
				}
				this.rotatingCircle.appendChild(circleGroup);
				this.trackingGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				const position = (circleRadius) / 4;
				let left, right, position1, position2, position3, fontSize, offset;
				if (circleRadius < 1000) {
					left = 42;
					right = 58;
					fontSize = 17;
					position1 = ((position * 2) - 55);
					position2 = ((position * 3) - 55);
					position3 = ((position * 4) - 55);
					offset =  5;
				} else {
					left = 35;
					right = 65;
					fontSize = 34;
					offset = 10;
					position1 = ((position * 2) - 225);
					position2 = ((position * 3) - 225);
					position3 = ((position * 4) - 225);
				}
				diffAndSetAttribute(this.trackingGroup, 'id', 'trackingGroup');
				{
					this.trackingLine = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.trackingLine, 'id', 'trackingLine');
					diffAndSetAttribute(this.trackingLine, 'd', 'M50 70 v ' + (circleRadius - 20) + ' L 50 ' + position1 + ' L ' + left + ' ' + position1 + ' L ' + right + ' ' + position1 + ' L 50 ' + position1 + ' L 50 ' + position2 + ' L ' + left + ' ' + position2 + ' L ' + right + ' ' + position2 + ' L 50 ' + position2 + ' L 50 ' + position3 + ' L ' + left + ' ' + position3 + ' L ' + right + ' ' + position3 + ' L 50 ' + position3);
					diffAndSetAttribute(this.trackingLine, 'fill', 'transparent');
					diffAndSetAttribute(this.trackingLine, 'stroke', 'white');
					diffAndSetAttribute(this.trackingLine, 'stroke-width', '3');
					this.trackingGroup.appendChild(this.trackingLine);

					this.trackingText = document.createElementNS(Avionics.SVG.NS, 'text');
					diffAndSetAttribute(this.trackingText, 'id', 'trackingText');
					diffAndSetAttribute(this.trackingText, 'irs-state', 'off');
					diffAndSetAttribute(this.trackingText, 'x', left - 110);
					diffAndSetAttribute(this.trackingText, 'y', -1 * position2 + offset);
					diffAndSetAttribute(this.trackingText, 'font-size', fontSize);
					diffAndSetAttribute(this.trackingText, 'text-anchor', 'end');
					diffAndSetAttribute(this.trackingText, 'fill', 'white');
					diffAndSetAttribute(this.trackingText, 'transform', 'rotate(180)');
					this.trackingText.innerHTML = '20';
					this.trackingGroup.appendChild(this.trackingText);
				}


				this.rotatingCircle.appendChild(this.trackingGroup);
				this.headingGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.headingGroup, 'id', 'headingGroup');
				diffAndSetAttribute(this.headingGroup, 'irs-state', 'off');
				{
					this.headingBug = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.headingBug, 'id', 'headingBug');
					diffAndSetAttribute(this.headingBug, 'd', 'M50 ' + (50 + circleRadius) + ' l -11 20 l 22 0 z');
					diffAndSetAttribute(this.headingBug, 'fill', 'none');
					diffAndSetAttribute(this.headingBug, 'stroke', 'white');
					this.headingGroup.appendChild(this.headingBug);
				}
				this.rotatingCircle.appendChild(this.headingGroup);
				this.courseGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.courseGroup, 'id', 'CourseInfo');
				diffAndSetAttribute(this.courseGroup, 'irs-state', 'off');
				this.rotatingCircle.appendChild(this.courseGroup);
				{
					let scale;
					let bearingScale;
					if (this._fullscreen) {
						scale = 0.8;
						bearingScale = 1.0;
						diffAndSetAttribute(this.courseGroup, 'transform', 'translate(10 10) scale(0.8)');
					} else {
						scale = 1.5;
						bearingScale = 0.8;
						diffAndSetAttribute(this.courseGroup, 'transform', 'translate(-24 -24) scale(1.5)');
					}
					let bearingScaleCorrection = -((50 * bearingScale) - 50);
					let bearing = document.createElementNS(Avionics.SVG.NS, 'g');
					diffAndSetAttribute(bearing, 'id', 'bearing');
					diffAndSetAttribute(bearing, 'transform', 'translate(' + bearingScaleCorrection + ' ' + bearingScaleCorrection + ') scale(' + bearingScale + ')');
					this.courseGroup.appendChild(bearing);
					{
						this.bearing1_Vor = document.createElementNS(Avionics.SVG.NS, 'path');
						if (this._fullscreen) {
							diffAndSetAttribute(this.bearing1_Vor, 'd', 'M60 -477 L50 -487 L40 -477 M50 -487 L50 -405 M70 -410 L30 -410     M50 510 L50 585 M65 585 L50 575 L35 585');
							diffAndSetAttribute(this.bearing1_Vor, 'stroke-width', '3');
						} else {
							diffAndSetAttribute(this.bearing1_Vor, 'd', 'M60 -870 L50 -880 L40 -870 M50 -880 L50 -805 M70 -810 L30 -810     M50 905 L50 980 M65 980 L50 970 L35 980');
							diffAndSetAttribute(this.bearing1_Vor, 'stroke-width', '4');
						}
						diffAndSetAttribute(this.bearing1_Vor, 'stroke', 'green');
						diffAndSetAttribute(this.bearing1_Vor, 'fill', 'none');
						diffAndSetAttribute(this.bearing1_Vor, 'id', 'bearing1_Vor');
						diffAndSetAttribute(this.bearing1_Vor, 'visibility', 'hidden');
						bearing.appendChild(this.bearing1_Vor);
						this.bearing1_Adf = document.createElementNS(Avionics.SVG.NS, 'path');
						if (this._fullscreen) {
							diffAndSetAttribute(this.bearing1_Adf, 'd', 'M60 -477 L50 -487 L40 -477 M50 -487 L50 -405 M70 -410 L30 -410     M50 510 L50 585 M65 585 L50 575 L35 585');
							diffAndSetAttribute(this.bearing1_Adf, 'stroke-width', '3');
						} else {
							diffAndSetAttribute(this.bearing1_Adf, 'd', 'M60 -870 L50 -880 L40 -870 M50 -880 L50 -805 M70 -810 L30 -810     M50 905 L50 980 M65 980 L50 970 L35 980');
							diffAndSetAttribute(this.bearing1_Adf, 'stroke-width', '4');
						}
						diffAndSetAttribute(this.bearing1_Adf, 'stroke', 'cyan');
						diffAndSetAttribute(this.bearing1_Adf, 'fill', 'none');
						diffAndSetAttribute(this.bearing1_Adf, 'id', 'bearing1_Adf');
						diffAndSetAttribute(this.bearing1_Adf, 'visibility', 'hidden');
						bearing.appendChild(this.bearing1_Adf);
						this.bearing2_Vor = document.createElementNS(Avionics.SVG.NS, 'path');
						if (this._fullscreen) {
							diffAndSetAttribute(this.bearing2_Vor, 'd', 'M60 -477 L50 -487 L40 -477 L40 -415 L30 -415 L30 -405 L70 -405 L70 -415 L60 -415 L60 -477        M65 585 L50 575 L35 585 L35 595 L50 585 L65 595 L65 585 M57 580 L57 517 L50 510 L43 517 L43 580');
							diffAndSetAttribute(this.bearing2_Vor, 'stroke-width', '3');
						} else {
							diffAndSetAttribute(this.bearing2_Vor, 'd', 'M60 -870 L50 -880 L40 -870 L40 -815 L30 -815 L30 -805 L70 -805 L70 -815 L60 -815 L60 -870        M65 978 L50 968 L35 978 L35 988 L50 978 L65 988 L65 978 M57 973 L57 910 L50 903 L43 910 L43 973');
							diffAndSetAttribute(this.bearing2_Vor, 'stroke-width', '4');
						}
						diffAndSetAttribute(this.bearing2_Vor, 'stroke', 'green');
						diffAndSetAttribute(this.bearing2_Vor, 'fill', 'none');
						diffAndSetAttribute(this.bearing2_Vor, 'id', 'bearing2_Vor');
						diffAndSetAttribute(this.bearing2_Vor, 'visibility', 'hidden');
						bearing.appendChild(this.bearing2_Vor);
						this.bearing2_Adf = document.createElementNS(Avionics.SVG.NS, 'path');
						if (this._fullscreen) {
							diffAndSetAttribute(this.bearing2_Adf, 'd', 'M60 -477 L50 -487 L40 -477 L40 -415 L30 -415 L30 -405 L70 -405 L70 -415 L60 -415 L60 -477        M65 585 L50 575 L35 585 L35 595 L50 585 L65 595 L65 585 M57 580 L57 517 L50 510 L43 517 L43 580');
							diffAndSetAttribute(this.bearing2_Adf, 'stroke-width', '3');
						} else {
							diffAndSetAttribute(this.bearing2_Adf, 'd', 'M60 -870 L50 -880 L40 -870 L40 -815 L30 -815 L30 -805 L70 -805 L70 -815 L60 -815 L60 -870        M65 978 L50 968 L35 978 L35 988 L50 978 L65 988 L65 978 M57 973 L57 910 L50 903 L43 910 L43 973');
							diffAndSetAttribute(this.bearing2_Adf, 'stroke-width', '4');
						}
						diffAndSetAttribute(this.bearing2_Adf, 'stroke', 'cyan');
						diffAndSetAttribute(this.bearing2_Adf, 'fill', 'none');
						diffAndSetAttribute(this.bearing2_Adf, 'id', 'bearing2_Adf');
						diffAndSetAttribute(this.bearing2_Adf, 'visibility', 'hidden');
						bearing.appendChild(this.bearing2_Adf);
					}
					this.course = document.createElementNS(Avionics.SVG.NS, 'g');
					diffAndSetAttribute(this.course, 'id', 'course');
					this.courseGroup.appendChild(this.course);
					{
						this.courseColor = '';
						if (this.navigationMode == Jet_NDCompass_Navigation.ILS) {
							this.courseColor = '#ff00ff';
						} else if (this.navigationMode == Jet_NDCompass_Navigation.VOR) {
							this.courseColor = '#00ffff';
						}
						this.courseTO = document.createElementNS(Avionics.SVG.NS, 'path');
						diffAndSetAttribute(this.courseTO, 'd', 'M46 110 l8 0 l0 25 l-4 5 l-4 -5 l0 -25 Z');
						diffAndSetAttribute(this.courseTO, 'fill', 'none');
						diffAndSetAttribute(this.courseTO, 'transform', 'rotate(180 50 50)');
						diffAndSetAttribute(this.courseTO, 'stroke', this.courseColor + '');
						diffAndSetAttribute(this.courseTO, 'stroke-width', '1');
						this.course.appendChild(this.courseTO);
						this.courseTOLine = document.createElementNS(Avionics.SVG.NS, 'path');
						diffAndSetAttribute(this.courseTOLine, 'd', 'M50 140 l0 ' + ((circleRadius / scale) - 90) + ' Z');
						diffAndSetAttribute(this.courseTOLine, 'transform', 'rotate(180 50 50)');
						diffAndSetAttribute(this.courseTOLine, 'stroke', this.courseColor + '');
						diffAndSetAttribute(this.courseTOLine, 'stroke-width', '1');
						this.course.appendChild(this.courseTOLine);
						this.courseDeviation = document.createElementNS(Avionics.SVG.NS, 'rect');
						diffAndSetAttribute(this.courseDeviation, 'x', '45');
						diffAndSetAttribute(this.courseDeviation, 'y', '-10');
						diffAndSetAttribute(this.courseDeviation, 'width', '10');
						diffAndSetAttribute(this.courseDeviation, 'height', '125');
						diffAndSetAttribute(this.courseDeviation, 'fill', this.courseColor + '');
						this.course.appendChild(this.courseDeviation);
						this.courseFROM = document.createElementNS(Avionics.SVG.NS, 'path');
						diffAndSetAttribute(this.courseFROM, 'd', 'M46 -15 l8 0 l0 -20 l-8 0 l0 20 Z');
						diffAndSetAttribute(this.courseFROM, 'fill', 'none');
						diffAndSetAttribute(this.courseFROM, 'transform', 'rotate(180 50 50)');
						diffAndSetAttribute(this.courseFROM, 'stroke', this.courseColor + '');
						diffAndSetAttribute(this.courseFROM, 'stroke-width', '1');
						this.course.appendChild(this.courseFROM);
						this.courseFROMLine = document.createElementNS(Avionics.SVG.NS, 'path');
						diffAndSetAttribute(this.courseFROMLine, 'd', 'M50 -35 l0 ' + (-(circleRadius / scale) + 85) + ' Z');
						diffAndSetAttribute(this.courseFROMLine, 'fill', 'none');
						diffAndSetAttribute(this.courseFROMLine, 'transform', 'rotate(180 50 50)');
						diffAndSetAttribute(this.courseFROMLine, 'stroke', this.courseColor + '');
						diffAndSetAttribute(this.courseFROMLine, 'stroke-width', '1');
						this.course.appendChild(this.courseFROMLine);
						let circlePosition = [-80, -40, 40, 80];
						for (let i = 0; i < circlePosition.length; i++) {
							let CDICircle = document.createElementNS(Avionics.SVG.NS, 'circle');
							diffAndSetAttribute(CDICircle, 'cx', (50 + circlePosition[i]) + '');
							diffAndSetAttribute(CDICircle, 'cy', '50');
							diffAndSetAttribute(CDICircle, 'r', '5');
							diffAndSetAttribute(CDICircle, 'fill', 'none');
							diffAndSetAttribute(CDICircle, 'stroke', 'white');
							diffAndSetAttribute(CDICircle, 'stroke-width', '2');
							this.course.appendChild(CDICircle);
						}
					}
				}
				this.selectedHeadingGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.selectedHeadingGroup, 'id', 'selectedHeadingGroup');
				diffAndSetAttribute(this.selectedHeadingGroup, 'irs-state', 'off');
				{
					this.selectedHeadingLine = Avionics.SVG.computeDashLine(50, 70, (circleRadius - 5), 15, 3, '#ff00e0');
					diffAndSetAttribute(this.selectedHeadingLine, 'id', 'selectedHeadingLine');
					this.selectedHeadingGroup.appendChild(this.selectedHeadingLine);
					this.selectedHeadingBug = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.selectedHeadingBug, 'id', 'selectedHeadingBug');
					diffAndSetAttribute(this.selectedHeadingBug, 'd', 'M50 ' + (50 + circleRadius) + ' h 22 v 22 h -7 l -15 -22 l -15 22 h -7 v -22 z');
					diffAndSetAttribute(this.selectedHeadingBug, 'stroke', '#ff00e0');
					diffAndSetAttribute(this.selectedHeadingBug, 'fill', 'none');
					this.selectedHeadingGroup.appendChild(this.selectedHeadingBug);
				}
				this.rotatingCircle.appendChild(this.selectedHeadingGroup);
				this.selectedTrackGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.selectedTrackGroup, 'id', 'selectedTrackGroup');
				diffAndSetAttribute(this.selectedTrackGroup, 'irs-state', 'off');
				{
					this.selectedTrackLine = Avionics.SVG.computeDashLine(50, 70, (circleRadius - 5), 15, 3, '#ff00e0');
					diffAndSetAttribute(this.selectedTrackLine, 'id', 'selectedTrackLine');
					this.selectedTrackGroup.appendChild(this.selectedTrackLine);
					this.selectedTrackBug = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.selectedTrackBug, 'id', 'selectedTrackBug');
					diffAndSetAttribute(this.selectedTrackBug, 'd', 'M50 ' + (50 + circleRadius) + ' h -30 v -15 l 30 -15 l 30 15 v 15 z');
					diffAndSetAttribute(this.selectedTrackBug, 'stroke', '#ff00e0');
					diffAndSetAttribute(this.selectedTrackBug, 'stroke-width', '2');
					this.selectedTrackGroup.appendChild(this.selectedTrackBug);
				}
				this.rotatingCircle.appendChild(this.selectedTrackGroup);
				this.ilsGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.ilsGroup, 'id', 'ILSGroup');
				diffAndSetAttribute(this.ilsGroup, 'irs-state', 'off');
				{
					let ilsBug = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(ilsBug, 'id', 'ilsBug');
					diffAndSetAttribute(ilsBug, 'd', 'M50 ' + (50 + circleRadius) + ' l0 40 M35 ' + (50 + circleRadius + 10) + ' l30 0');
					diffAndSetAttribute(ilsBug, 'fill', 'transparent');
					diffAndSetAttribute(ilsBug, 'stroke', '#FF0CE2');
					diffAndSetAttribute(ilsBug, 'stroke-width', '3');
					this.ilsGroup.appendChild(ilsBug);
				}
				this.rotatingCircle.appendChild(this.ilsGroup);
			}
			{
				this.currentRefGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.currentRefGroup, 'id', 'currentRefGroup');
				diffAndSetAttribute(this.currentRefGroup, 'irs-state', 'off');
				{
					if (!this._fullscreen) {
						diffAndSetAttribute(this.currentRefGroup, 'transform', 'translate(-10 212) scale(1.2)');
					}
					let centerX = 50;
					let centerY = 50 - circleRadius - 40;
					let rectWidth = 65;
					let rectHeight = 40;
					let textOffset = 5;
					this.currentRefMode = document.createElementNS(Avionics.SVG.NS, 'text');
					diffAndSetText(this.currentRefMode, 'HDG');
					diffAndSetAttribute(this.currentRefMode, 'x', (centerX - rectWidth * 0.5 - textOffset) + '');
					diffAndSetAttribute(this.currentRefMode, 'y', centerY + '');
					diffAndSetAttribute(this.currentRefMode, 'fill', 'green');
					diffAndSetAttribute(this.currentRefMode, 'font-size', '23');
					diffAndSetAttribute(this.currentRefMode, 'font-family', 'Roboto-Bold');
					diffAndSetAttribute(this.currentRefMode, 'text-anchor', 'end');
					diffAndSetAttribute(this.currentRefMode, 'alignment-baseline', 'central');
					this.currentRefGroup.appendChild(this.currentRefMode);
					let rect = document.createElementNS(Avionics.SVG.NS, 'rect');
					diffAndSetAttribute(rect, 'x', (centerX - rectWidth * 0.5) + '');
					diffAndSetAttribute(rect, 'y', (centerY - rectHeight * 0.5) + '');
					diffAndSetAttribute(rect, 'width', rectWidth + '');
					diffAndSetAttribute(rect, 'height', rectHeight + '');
					diffAndSetAttribute(rect, 'fill', 'black');
					this.currentRefGroup.appendChild(rect);
					let path = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(path, 'd', 'M' + (centerX - (rectWidth * 0.5)) + ' ' + (centerY - (rectHeight * 0.5)) + ' l0 ' + rectHeight + ' l' + rectWidth + ' 0 l0 ' + (-rectHeight));
					diffAndSetAttribute(path, 'fill', 'none');
					diffAndSetAttribute(path, 'stroke', 'white');
					diffAndSetAttribute(path, 'stroke-width', '1');
					this.currentRefGroup.appendChild(path);
					this.currentRefValue = document.createElementNS(Avionics.SVG.NS, 'text');
					diffAndSetText(this.currentRefValue, '266');
					diffAndSetAttribute(this.currentRefValue, 'x', centerX + '');
					diffAndSetAttribute(this.currentRefValue, 'y', centerY + '');
					diffAndSetAttribute(this.currentRefValue, 'fill', 'white');
					diffAndSetAttribute(this.currentRefValue, 'font-size', '28');
					diffAndSetAttribute(this.currentRefValue, 'font-family', 'Roboto-Bold');
					diffAndSetAttribute(this.currentRefValue, 'text-anchor', 'middle');
					diffAndSetAttribute(this.currentRefValue, 'alignment-baseline', 'central');
					this.currentRefGroup.appendChild(this.currentRefValue);
					this.currentRefType = document.createElementNS(Avionics.SVG.NS, 'text');
					diffAndSetText(this.currentRefType, 'MAG');
					diffAndSetAttribute(this.currentRefType, 'x', (centerX + rectWidth * 0.5 + textOffset) + '');
					diffAndSetAttribute(this.currentRefType, 'y', centerY + '');
					diffAndSetAttribute(this.currentRefType, 'fill', 'green');
					diffAndSetAttribute(this.currentRefType, 'font-size', '23');
					diffAndSetAttribute(this.currentRefType, 'font-family', 'Roboto-Bold');
					diffAndSetAttribute(this.currentRefType, 'text-anchor', 'start');
					diffAndSetAttribute(this.currentRefType, 'alignment-baseline', 'central');
					this.currentRefGroup.appendChild(this.currentRefType);
				}
				viewBox.appendChild(this.currentRefGroup);
				let rangeGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(rangeGroup, 'id', 'RangeGroup');
				diffAndSetAttribute(rangeGroup, 'irs-state', 'off');
				{
					let centerX = -185;
					let centerY = 50 - circleRadius;
					if (this._fullscreen) {
						diffAndSetAttribute(rangeGroup, 'transform', 'scale(0.8)');
						centerX += 2;
						centerY -= 141;
					} else {
						centerY -= 40;
					}
					let textBg = document.createElementNS(Avionics.SVG.NS, 'rect');
					diffAndSetAttribute(textBg, 'x', (centerX - 40) + '');
					diffAndSetAttribute(textBg, 'y', (centerY - 32) + '');
					diffAndSetAttribute(textBg, 'width', '80');
					diffAndSetAttribute(textBg, 'height', '64');
					diffAndSetAttribute(textBg, 'fill', 'black');
					diffAndSetAttribute(textBg, 'stroke', 'white');
					diffAndSetAttribute(textBg, 'stroke-width', '2');
					rangeGroup.appendChild(textBg);
					let textTitle = document.createElementNS(Avionics.SVG.NS, 'text');
					diffAndSetText(textTitle, 'RANGE');
					diffAndSetAttribute(textTitle, 'x', centerX + '');
					diffAndSetAttribute(textTitle, 'y', (centerY - 15) + '');
					diffAndSetAttribute(textTitle, 'fill', 'white');
					diffAndSetAttribute(textTitle, 'font-size', '25');
					diffAndSetAttribute(textTitle, 'font-family', 'Roboto-Light');
					diffAndSetAttribute(textTitle, 'text-anchor', 'middle');
					diffAndSetAttribute(textTitle, 'alignment-baseline', 'central');
					rangeGroup.appendChild(textTitle);
					this.addMapRange(rangeGroup, centerX, (centerY + 15), 'white', '25', false, 1.0, false);
				}
				viewBox.appendChild(rangeGroup);
			}
		}
	}

	constructPlan() {
		super.constructPlan();
		this.constructPlan_AS01B();
	}

	constructPlan_AS01B() {
		this.root = document.createElementNS(Avionics.SVG.NS, 'svg');
		diffAndSetAttribute(this.root, 'width', '100%');
		diffAndSetAttribute(this.root, 'height', '100%');
		diffAndSetAttribute(this.root, 'viewBox', '0 0 1000 1000');
		this.appendChild(this.root);
		{
			let circleRadius = 333;
			let outerCircleGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			this.root.appendChild(outerCircleGroup);
			{
				let texts = ['N', 'E', 'S', 'W'];
				for (let i = 0; i < 4; i++) {
					let textGroup = document.createElementNS(Avionics.SVG.NS, 'g');
					diffAndSetAttribute(textGroup, 'transform', 'rotate(' + fastToFixed(i * 90, 0) + ' 500 500)');
					{
						let text = document.createElementNS(Avionics.SVG.NS, 'text');
						diffAndSetText(text, texts[i]);
						diffAndSetAttribute(text, 'irs-state', 'off');
						diffAndSetAttribute(text, 'x', '500');
						diffAndSetAttribute(text, 'y', '115');
						diffAndSetAttribute(text, 'fill', 'white');
						diffAndSetAttribute(text, 'font-size', '50');
						diffAndSetAttribute(text, 'font-family', 'Roboto-Light');
						diffAndSetAttribute(text, 'text-anchor', 'middle');
						diffAndSetAttribute(text, 'alignment-baseline', 'central');
						diffAndSetAttribute(text, 'transform', 'rotate(' + -fastToFixed(i * 90, 0) + ' 500 115)');
						textGroup.appendChild(text);
						outerCircleGroup.appendChild(textGroup);
					}
				}
				let outerCircle = document.createElementNS(Avionics.SVG.NS, 'circle');
				diffAndSetAttribute(outerCircle, 'cx', '500');
				diffAndSetAttribute(outerCircle, 'cy', '500');
				diffAndSetAttribute(outerCircle, 'r', circleRadius + '');
				diffAndSetAttribute(outerCircle, 'fill', 'none');
				diffAndSetAttribute(outerCircle, 'stroke', 'white');
				diffAndSetAttribute(outerCircle, 'stroke-width', '4');
				outerCircleGroup.appendChild(outerCircle);
				this.addMapRange(outerCircleGroup, 500, 167, 'white', '30', true, 1, true);
				this.addMapRange(outerCircleGroup, 500, 833, 'white', '30', true, 1, true);
			}
			let innerCircleGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			this.root.appendChild(innerCircleGroup);
			{
				let innerCircle = document.createElementNS(Avionics.SVG.NS, 'circle');
				diffAndSetAttribute(innerCircle, 'cx', '500');
				diffAndSetAttribute(innerCircle, 'cy', '500');
				diffAndSetAttribute(innerCircle, 'r', '166');
				diffAndSetAttribute(innerCircle, 'fill', 'none');
				diffAndSetAttribute(innerCircle, 'stroke', 'white');
				diffAndSetAttribute(innerCircle, 'stroke-width', '4');
				innerCircleGroup.appendChild(innerCircle);
				this.addMapRange(innerCircleGroup, 500, 334, 'white', '30', true, 0.5, true);
				this.addMapRange(innerCircleGroup, 500, 666, 'white', '30', true, 0.5, true);
			}
			let rangeGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(rangeGroup, 'id', 'RangeGroup');
			{
				let centerX = 145;
				let centerY = 67;
				if (this._fullscreen) {
					diffAndSetAttribute(rangeGroup, 'transform', 'scale(1.27)');
				} else {
					centerX = 266;
					centerY = 98;
				}
				let textBg = document.createElementNS(Avionics.SVG.NS, 'rect');
				diffAndSetAttribute(textBg, 'x', (centerX - 40) + '');
				diffAndSetAttribute(textBg, 'y', (centerY - 32) + '');
				diffAndSetAttribute(textBg, 'width', '80');
				diffAndSetAttribute(textBg, 'height', '64');
				diffAndSetAttribute(textBg, 'fill', 'black');
				diffAndSetAttribute(textBg, 'stroke', 'white');
				diffAndSetAttribute(textBg, 'stroke-width', '2');
				rangeGroup.appendChild(textBg);
				let textTitle = document.createElementNS(Avionics.SVG.NS, 'text');
				diffAndSetText(textTitle, 'RANGE');
				diffAndSetAttribute(textTitle, 'x', (centerX - 0.5) + '');
				diffAndSetAttribute(textTitle, 'y', (centerY - 14) + '');
				diffAndSetAttribute(textTitle, 'fill', 'white');
				diffAndSetAttribute(textTitle, 'font-size', '25');
				diffAndSetAttribute(textTitle, 'font-family', 'Roboto-Light');
				diffAndSetAttribute(textTitle, 'text-anchor', 'middle');
				diffAndSetAttribute(textTitle, 'alignment-baseline', 'central');
				rangeGroup.appendChild(textTitle);
				this.addMapRange(rangeGroup, (centerX - 0.5), (centerY + 15.5), 'white', '25', false, 1.0, false);
			}
			this.root.appendChild(rangeGroup);
		}
	}

	constructRose() {
		super.constructRose();
		this.constructRose_AS01B();
	}

	constructRose_AS01B() {
		this.root = document.createElementNS(Avionics.SVG.NS, 'svg');
		diffAndSetAttribute(this.root, 'width', '100%');
		diffAndSetAttribute(this.root, 'height', '100%');
		diffAndSetAttribute(this.root, 'viewBox', '0 0 1000 1000');
		this.appendChild(this.root);
		let circleRadius = 400;
		{
			this.rotatingCircle = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.rotatingCircle, 'id', 'RotatingCircle');
			this.root.appendChild(this.rotatingCircle);
			let outerGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(outerGroup, 'id', 'outerCircle');
			this.rotatingCircle.appendChild(outerGroup);
			{
				for (let i = 0; i < 72; i++) {
					let line = document.createElementNS(Avionics.SVG.NS, 'rect');
					let startY = 500 - circleRadius;
					let length = 30;
					if (i % 2 != 0) {
						if (this.navigationMode == Jet_NDCompass_Navigation.NONE || this.navigationMode == Jet_NDCompass_Navigation.NAV)
							continue;
						length = 13;
					}
					if (i % 9 == 0) {
						if (this.navigationMode != Jet_NDCompass_Navigation.NONE && this.navigationMode != Jet_NDCompass_Navigation.NAV) {
							startY -= 30;
							length += 30;
						}
					}
					diffAndSetAttribute(line, 'x', '498');
					diffAndSetAttribute(line, 'y', startY + '');
					diffAndSetAttribute(line, 'width', '4');
					diffAndSetAttribute(line, 'height', length + '');
					diffAndSetAttribute(line, 'transform', 'rotate(' + fastToFixed(i * 5, 0) + ' 500 500)');
					diffAndSetAttribute(line, 'fill', 'white');
					outerGroup.appendChild(line);
				}
				for (let i = 0; i < 36; i += 3) {
					let text = document.createElementNS(Avionics.SVG.NS, 'text');
					diffAndSetText(text, fastToFixed(i, 0));
					diffAndSetAttribute(text, 'x', '500');
					diffAndSetAttribute(text, 'y', (500 - circleRadius + 52) + '');
					diffAndSetAttribute(text, 'fill', 'white');
					diffAndSetAttribute(text, 'font-size', '40');
					diffAndSetAttribute(text, 'font-family', 'Roboto-Light');
					diffAndSetAttribute(text, 'text-anchor', 'middle');
					diffAndSetAttribute(text, 'alignment-baseline', 'central');
					diffAndSetAttribute(text, 'transform', 'rotate(' + fastToFixed(i * 10, 0) + ' 500 500)');
					outerGroup.appendChild(text);
				}
			}
			this.courseGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.courseGroup, 'id', 'CourseInfo');
			this.rotatingCircle.appendChild(this.courseGroup);
			{
				let bearingScale = 1.11;
				let bearingScaleCorrection = -(500 * bearingScale - 500);
				let bearing = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(bearing, 'id', 'bearing');
				diffAndSetAttribute(bearing, 'transform', 'translate(' + bearingScaleCorrection + ' ' + bearingScaleCorrection + ') scale(' + bearingScale + ')');
				this.courseGroup.appendChild(bearing);
				{
					this.bearing1_Vor = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.bearing1_Vor, 'd', 'M510 140 L500 130 L490 140 M500 130 L500 230 M520 220 L480 220     M500 770 L500 870   M520 870 L500 860 L480 870');
					diffAndSetAttribute(this.bearing1_Vor, 'stroke', 'green');
					diffAndSetAttribute(this.bearing1_Vor, 'stroke-width', '4');
					diffAndSetAttribute(this.bearing1_Vor, 'fill', 'none');
					diffAndSetAttribute(this.bearing1_Vor, 'id', 'bearing1_Vor');
					diffAndSetAttribute(this.bearing1_Vor, 'visibility', 'hidden');
					bearing.appendChild(this.bearing1_Vor);
					this.bearing1_Adf = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.bearing1_Adf, 'd', 'M510 140 L500 130 L490 140 M500 130 L500 230 M520 220 L480 220     M500 770 L500 870   M520 870 L500 860 L480 870');
					diffAndSetAttribute(this.bearing1_Adf, 'stroke', 'cyan');
					diffAndSetAttribute(this.bearing1_Adf, 'stroke-width', '4');
					diffAndSetAttribute(this.bearing1_Adf, 'fill', 'none');
					diffAndSetAttribute(this.bearing1_Adf, 'id', 'bearing1_Adf');
					diffAndSetAttribute(this.bearing1_Adf, 'visibility', 'hidden');
					bearing.appendChild(this.bearing1_Adf);
					this.bearing2_Vor = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.bearing2_Vor, 'd', 'M510 140 L500 130 L490 140 L490 220 L470 220 L470 230 L530 230 L530 220 L510 220 L510 140      M500 860 L500 870    M510 865 L510 780 L500 770 L490 780 L490 865     M520 870 L500 860 L480 870 L480 880 L500 870 L520 880 L520 870');
					diffAndSetAttribute(this.bearing2_Vor, 'stroke', 'green');
					diffAndSetAttribute(this.bearing2_Vor, 'stroke-width', '4');
					diffAndSetAttribute(this.bearing2_Vor, 'fill', 'none');
					diffAndSetAttribute(this.bearing2_Vor, 'id', 'bearing2_Vor');
					diffAndSetAttribute(this.bearing2_Vor, 'visibility', 'hidden');
					bearing.appendChild(this.bearing2_Vor);
					this.bearing2_Adf = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.bearing2_Adf, 'd', 'M510 140 L500 130 L490 140 L490 220 L470 220 L470 230 L530 230 L530 220 L510 220 L510 140      M500 860 L500 870    M510 865 L510 780 L500 770 L490 780 L490 865     M520 870 L500 860 L480 870 L480 880 L500 870 L520 880 L520 870');
					diffAndSetAttribute(this.bearing2_Adf, 'stroke', 'cyan');
					diffAndSetAttribute(this.bearing2_Adf, 'stroke-width', '4');
					diffAndSetAttribute(this.bearing2_Adf, 'fill', 'none');
					diffAndSetAttribute(this.bearing2_Adf, 'id', 'bearing2_Adf');
					diffAndSetAttribute(this.bearing2_Adf, 'visibility', 'hidden');
					bearing.appendChild(this.bearing2_Adf);
				}
				this.course = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.course, 'id', 'course');
				this.courseGroup.appendChild(this.course);
				{
					this.courseColor = '';
					if (this.navigationMode == Jet_NDCompass_Navigation.ILS) {
						this.courseColor = '#ff00ff';
					} else if (this.navigationMode == Jet_NDCompass_Navigation.VOR) {
						this.courseColor = '#00ffff';
					}
					this.courseTO = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.courseTO, 'd', 'M497 666 L503 666 L503 696 L523 696 L523 702 L503 702 L503 826 L497 826 L497 702 L477 702 L477 696 L497 696 L497 666 Z');
					diffAndSetAttribute(this.courseTO, 'fill', 'none');
					diffAndSetAttribute(this.courseTO, 'transform', 'rotate(180 500 500)');
					diffAndSetAttribute(this.courseTO, 'stroke', this.courseColor + '');
					diffAndSetAttribute(this.courseTO, 'stroke-width', '1');
					this.course.appendChild(this.courseTO);
					this.courseDeviation = document.createElementNS(Avionics.SVG.NS, 'rect');
					diffAndSetAttribute(this.courseDeviation, 'x', '495');
					diffAndSetAttribute(this.courseDeviation, 'y', '333');
					diffAndSetAttribute(this.courseDeviation, 'width', '10');
					diffAndSetAttribute(this.courseDeviation, 'height', '333');
					diffAndSetAttribute(this.courseDeviation, 'fill', this.courseColor + '');
					this.course.appendChild(this.courseDeviation);
					this.courseFROM = document.createElementNS(Avionics.SVG.NS, 'rect');
					diffAndSetAttribute(this.courseFROM, 'x', '497');
					diffAndSetAttribute(this.courseFROM, 'y', '166');
					diffAndSetAttribute(this.courseFROM, 'width', '6');
					diffAndSetAttribute(this.courseFROM, 'height', '166');
					diffAndSetAttribute(this.courseFROM, 'fill', 'none');
					diffAndSetAttribute(this.courseFROM, 'transform', 'rotate(180 500 500)');
					diffAndSetAttribute(this.courseFROM, 'stroke', this.courseColor + '');
					diffAndSetAttribute(this.courseFROM, 'stroke-width', '1');
					this.course.appendChild(this.courseFROM);
					let circlePosition = [-166, -55, 55, 166];
					for (let i = 0; i < circlePosition.length; i++) {
						let CDICircle = document.createElementNS(Avionics.SVG.NS, 'circle');
						diffAndSetAttribute(CDICircle, 'cx', (500 + circlePosition[i]) + '');
						diffAndSetAttribute(CDICircle, 'cy', '500');
						diffAndSetAttribute(CDICircle, 'r', '10');
						diffAndSetAttribute(CDICircle, 'stroke', 'white');
						diffAndSetAttribute(CDICircle, 'stroke-width', '2');
						this.course.appendChild(CDICircle);
					}
				}
			}
			this.trackingGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.trackingGroup, 'id', 'trackingGroup');
			{
				this.trackingLine = document.createElementNS(Avionics.SVG.NS, 'path');
				diffAndSetAttribute(this.trackingLine, 'id', 'trackingLine');
				diffAndSetAttribute(this.trackingLine, 'd', 'M500 450 v ' + (-circleRadius + 50));
				diffAndSetAttribute(this.trackingLine, 'fill', 'transparent');
				diffAndSetAttribute(this.trackingLine, 'stroke', 'white');
				diffAndSetAttribute(this.trackingLine, 'stroke-width', '3');
				this.trackingGroup.appendChild(this.trackingLine);
			}
			this.rotatingCircle.appendChild(this.trackingGroup);
			this.headingGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.headingGroup, 'id', 'headingGroup');
			{
				this.headingBug = document.createElementNS(Avionics.SVG.NS, 'path');
				diffAndSetAttribute(this.headingBug, 'id', 'headingBug');
				diffAndSetAttribute(this.headingBug, 'd', 'M500 ' + (500 - circleRadius) + ' l -11 -20 l 22 0 z');
				diffAndSetAttribute(this.headingBug, 'fill', 'none');
				diffAndSetAttribute(this.headingBug, 'stroke', 'white');
				this.headingGroup.appendChild(this.headingBug);
			}
			this.rotatingCircle.appendChild(this.headingGroup);
			this.selectedHeadingGroup = document.createElementNS(Avionics.SVG.NS, 'g');
			diffAndSetAttribute(this.selectedHeadingGroup, 'id', 'selectedHeadingGroup');
			{
				this.selectedHeadingLine = Avionics.SVG.computeDashLine(500, 450, -(circleRadius - 50), 15, 3, '#ff00e0');
				diffAndSetAttribute(this.selectedHeadingLine, 'id', 'selectedHeadingLine');
				this.selectedHeadingGroup.appendChild(this.selectedHeadingLine);
				this.selectedHeadingBug = document.createElementNS(Avionics.SVG.NS, 'path');
				diffAndSetAttribute(this.selectedHeadingBug, 'id', 'selectedHeadingBug');
				diffAndSetAttribute(this.selectedHeadingBug, 'd', 'M500 ' + (500 - circleRadius) + ' h 22 v -22 h -7 l -15 22 l -15 -22 h -7 v 22 z');
				diffAndSetAttribute(this.selectedHeadingBug, 'stroke', '#ff00e0');
				diffAndSetAttribute(this.selectedHeadingBug, 'fill', 'none');
				this.selectedHeadingGroup.appendChild(this.selectedHeadingBug);
			}
			this.rotatingCircle.appendChild(this.selectedHeadingGroup);
			if (this.navigationMode == Jet_NDCompass_Navigation.NAV || this.navigationMode == Jet_NDCompass_Navigation.ILS) {
				this.ilsGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.ilsGroup, 'id', 'ILSGroup');
				{
					let ilsBug = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(ilsBug, 'id', 'ilsBug');
					diffAndSetAttribute(ilsBug, 'd', 'M500 ' + (500 - circleRadius) + ' l0 -40 M485 ' + (500 - circleRadius - 10) + ' l30 0');
					diffAndSetAttribute(ilsBug, 'fill', 'transparent');
					diffAndSetAttribute(ilsBug, 'stroke', '#FF0CE2');
					diffAndSetAttribute(ilsBug, 'stroke-width', '3');
					this.ilsGroup.appendChild(ilsBug);
				}
				this.rotatingCircle.appendChild(this.ilsGroup);
			}
			if (this.navigationMode == Jet_NDCompass_Navigation.NAV) {
				this.selectedTrackGroup = document.createElementNS(Avionics.SVG.NS, 'g');
				diffAndSetAttribute(this.selectedTrackGroup, 'id', 'selectedTrackGroup');
				{
					this.selectedTrackLine = Avionics.SVG.computeDashLine(500, 450, -(circleRadius - 50), 15, 3, '#ff00e0');
					diffAndSetAttribute(this.selectedTrackLine, 'id', 'selectedTrackLine');
					this.selectedTrackGroup.appendChild(this.selectedTrackLine);
					this.selectedTrackBug = document.createElementNS(Avionics.SVG.NS, 'path');
					diffAndSetAttribute(this.selectedTrackBug, 'id', 'selectedTrackBug');
					diffAndSetAttribute(this.selectedTrackBug, 'd', 'M500 ' + (500 - circleRadius) + ' h -30 v 15 l 30 15 l 30 -15 v -15 z');
					diffAndSetAttribute(this.selectedTrackBug, 'stroke', '#ff00e0');
					diffAndSetAttribute(this.selectedTrackBug, 'stroke-width', '2');
					this.selectedTrackGroup.appendChild(this.selectedTrackBug);
				}
				this.rotatingCircle.appendChild(this.selectedTrackGroup);
			}
		}
		this.glideSlopeGroup = document.createElementNS(Avionics.SVG.NS, 'g');
		diffAndSetAttribute(this.glideSlopeGroup, 'id', 'GlideSlopeGroup');
		this.root.appendChild(this.glideSlopeGroup);
		if (this._fullscreen)
			diffAndSetAttribute(this.glideSlopeGroup, 'transform', 'translate(-20, 0)');
		else
			diffAndSetAttribute(this.glideSlopeGroup, 'transform', 'translate(20, 20)');
		if (this.navigationMode === Jet_NDCompass_Navigation.ILS) {
			for (let i = 0; i < 5; i++) {
				if (i != 2) {
					let glideSlopeDot = document.createElementNS(Avionics.SVG.NS, 'circle');
					diffAndSetAttribute(glideSlopeDot, 'cx', '950');
					diffAndSetAttribute(glideSlopeDot, 'cy', fastToFixed((250 + i * 125), 0));
					diffAndSetAttribute(glideSlopeDot, 'r', '10');
					diffAndSetAttribute(glideSlopeDot, 'stroke', 'white');
					diffAndSetAttribute(glideSlopeDot, 'stroke-width', '2');
					this.glideSlopeGroup.appendChild(glideSlopeDot);
				}
			}
			let glideSlopeDash = document.createElementNS(Avionics.SVG.NS, 'rect');
			diffAndSetAttribute(glideSlopeDash, 'x', '935');
			diffAndSetAttribute(glideSlopeDash, 'y', '498');
			diffAndSetAttribute(glideSlopeDash, 'width', '30');
			diffAndSetAttribute(glideSlopeDash, 'height', '4');
			diffAndSetAttribute(glideSlopeDash, 'fill', 'yellow');
			this.glideSlopeGroup.appendChild(glideSlopeDash);
			this.glideSlopeCursor = document.createElementNS(Avionics.SVG.NS, 'path');
			diffAndSetAttribute(this.glideSlopeCursor, 'id', 'GlideSlopeCursor');
			diffAndSetAttribute(this.glideSlopeCursor, 'transform', 'translate(' + 950 + ' ' + 500 + ')');
			diffAndSetAttribute(this.glideSlopeCursor, 'd', 'M-15 0 L0 -20 L15 0 M-15 0 L0 20 L15 0');
			diffAndSetAttribute(this.glideSlopeCursor, 'stroke', '#ff00ff');
			diffAndSetAttribute(this.glideSlopeCursor, 'stroke-width', '2');
			diffAndSetAttribute(this.glideSlopeCursor, 'fill', 'none');
			this.glideSlopeGroup.appendChild(this.glideSlopeCursor);
		}
		this.currentRefGroup = document.createElementNS(Avionics.SVG.NS, 'g');
		diffAndSetAttribute(this.currentRefGroup, 'id', 'currentRefGroup');
		{
			let centerX = 500;
			let centerY = (500 - circleRadius - 50);
			let rectWidth = 100;
			let rectHeight = 55;
			let textOffset = 10;
			this.currentRefMode = document.createElementNS(Avionics.SVG.NS, 'text');
			diffAndSetText(this.currentRefMode, 'HDG');
			diffAndSetAttribute(this.currentRefMode, 'x', (centerX - rectWidth * 0.5 - textOffset) + '');
			diffAndSetAttribute(this.currentRefMode, 'y', centerY + '');
			diffAndSetAttribute(this.currentRefMode, 'fill', 'green');
			diffAndSetAttribute(this.currentRefMode, 'font-size', '35');
			diffAndSetAttribute(this.currentRefMode, 'font-family', 'Roboto-Bold');
			diffAndSetAttribute(this.currentRefMode, 'text-anchor', 'end');
			diffAndSetAttribute(this.currentRefMode, 'alignment-baseline', 'central');
			this.currentRefGroup.appendChild(this.currentRefMode);
			let rect = document.createElementNS(Avionics.SVG.NS, 'rect');
			diffAndSetAttribute(rect, 'x', (centerX - rectWidth * 0.5) + '');
			diffAndSetAttribute(rect, 'y', (centerY - rectHeight * 0.5) + '');
			diffAndSetAttribute(rect, 'width', rectWidth + '');
			diffAndSetAttribute(rect, 'height', rectHeight + '');
			diffAndSetAttribute(rect, 'fill', 'black');
			this.currentRefGroup.appendChild(rect);
			let path = document.createElementNS(Avionics.SVG.NS, 'path');
			diffAndSetAttribute(path, 'd', 'M' + (centerX - (rectWidth * 0.5)) + ' ' + (centerY - (rectHeight * 0.5)) + ' l0 ' + rectHeight + ' l' + rectWidth + ' 0 l0 ' + (-rectHeight));
			diffAndSetAttribute(path, 'fill', 'none');
			diffAndSetAttribute(path, 'stroke', 'white');
			diffAndSetAttribute(path, 'stroke-width', '1');
			this.currentRefGroup.appendChild(path);
			this.currentRefValue = document.createElementNS(Avionics.SVG.NS, 'text');
			diffAndSetText(this.currentRefValue, '266');
			diffAndSetAttribute(this.currentRefValue, 'x', centerX + '');
			diffAndSetAttribute(this.currentRefValue, 'y', centerY + '');
			diffAndSetAttribute(this.currentRefValue, 'fill', 'white');
			diffAndSetAttribute(this.currentRefValue, 'font-size', '35');
			diffAndSetAttribute(this.currentRefValue, 'font-family', 'Roboto-Bold');
			diffAndSetAttribute(this.currentRefValue, 'text-anchor', 'middle');
			diffAndSetAttribute(this.currentRefValue, 'alignment-baseline', 'central');
			this.currentRefGroup.appendChild(this.currentRefValue);
			this.currentRefType = document.createElementNS(Avionics.SVG.NS, 'text');
			diffAndSetText(this.currentRefType, 'MAG');
			diffAndSetAttribute(this.currentRefType, 'x', (centerX + rectWidth * 0.5 + textOffset) + '');
			diffAndSetAttribute(this.currentRefType, 'y', centerY + '');
			diffAndSetAttribute(this.currentRefType, 'fill', 'green');
			diffAndSetAttribute(this.currentRefType, 'font-size', '35');
			diffAndSetAttribute(this.currentRefType, 'font-family', 'Roboto-Bold');
			diffAndSetAttribute(this.currentRefType, 'text-anchor', 'start');
			diffAndSetAttribute(this.currentRefType, 'alignment-baseline', 'central');
			this.currentRefGroup.appendChild(this.currentRefType);
		}
		this.root.appendChild(this.currentRefGroup);
		let rangeGroup = document.createElementNS(Avionics.SVG.NS, 'g');
		diffAndSetAttribute(rangeGroup, 'id', 'RangeGroup');
		{
			let centerX = 146;
			let centerY = 43;
			if (this._fullscreen) {
				diffAndSetAttribute(rangeGroup, 'transform', 'scale(1.27)');
			} else {
				centerX = 266;
				centerY = 53;
			}
			let textBg = document.createElementNS(Avionics.SVG.NS, 'rect');
			diffAndSetAttribute(textBg, 'x', (centerX - 40) + '');
			diffAndSetAttribute(textBg, 'y', (centerY - 32) + '');
			diffAndSetAttribute(textBg, 'width', '80');
			diffAndSetAttribute(textBg, 'height', '64');
			diffAndSetAttribute(textBg, 'fill', 'black');
			diffAndSetAttribute(textBg, 'stroke', 'white');
			diffAndSetAttribute(textBg, 'stroke-width', '2');
			rangeGroup.appendChild(textBg);
			let textTitle = document.createElementNS(Avionics.SVG.NS, 'text');
			diffAndSetText(textTitle, 'RANGE');
			diffAndSetAttribute(textTitle, 'x', (centerX - 0.5) + '');
			diffAndSetAttribute(textTitle, 'y', (centerY - 14) + '');
			diffAndSetAttribute(textTitle, 'fill', 'white');
			diffAndSetAttribute(textTitle, 'font-size', '25');
			diffAndSetAttribute(textTitle, 'font-family', 'Roboto-Light');
			diffAndSetAttribute(textTitle, 'text-anchor', 'middle');
			diffAndSetAttribute(textTitle, 'alignment-baseline', 'central');
			rangeGroup.appendChild(textTitle);
			this.addMapRange(rangeGroup, (centerX - 0.5), (centerY + 15.5), 'white', '25', false, 1.0, false);
		}
		this.root.appendChild(rangeGroup);
	}

}

customElements.define('jet-mfd-nd-compass', Jet_MFD_NDCompass);
//# sourceMappingURL=NDCompass.js.map