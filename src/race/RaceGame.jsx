import { useEffect, useRef } from "react";
import Phaser from "phaser";
import countdownRoar from "../assets/sounds/countdownRoar.mp3";
import engineRun from "../assets/sounds/engineRun.mp3";
import controlSound from "../assets/sounds/controlSound.mp3";
import crashSound from "../assets/sounds/crash.mp3";
import beepSound from "../assets/sounds/beep.mp3";
import idleEngine from "../assets/sounds/idleEngine.mp3";

export default function RaceGame({
  player1Car,
  player2Car,
  player1Name,
  player2Name,
  totalLaps,
  selectedTrack,
  onQuit,
}) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initializedRef.current) return;
    initializedRef.current = true;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: "#a0d468",
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          overlapBias: 16,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    let p1;
    let p2;
    let cursors;
    let keys;
    let trackPoints = [];
    let raceStarted = false;
    let countdownText;
    let lights = [];
    let p1Lap = 0;
    let p2Lap = 0;
    let p1CanCountLap = false;
    let p2CanCountLap = false;
    let p1PassedCheckpoint = false;
    let p2PassedCheckpoint = false;
    let raceStartedMoving = false;
    let lapText;
    let winnerText;
    let restartButton;
    let menuButton;
    let menuPanel;
    let resumeBtn;
    let restartMenuBtn;
    let quitBtn;
    let menuOpen = false;
    let raceFinished = false;
    let lastCrashTime = 0;
    let countdownRoarAudio;
    let engineRunAudio;
    let controlAudio;
    let crashAudio;
    let beepAudio;
    let idleEngineAudio;
    let controlSoundPlaying = false;

    function preload() {
      this.load.image("p1car", player1Car.car);
      this.load.image("p2car", player2Car.car);
      this.load.audio("countdownRoar", countdownRoar);
      this.load.audio("engineRun", engineRun);
      this.load.audio("controlSound", controlSound);
      this.load.audio("crash", crashSound);
      this.load.audio("beep", beepSound);
      this.load.audio("idleEngine", idleEngine);
    }

    function drawTree(scene, x, y, scale = 1) {
      const tree = scene.add.graphics();
      tree.fillStyle(0x8d6e63, 1);
      tree.fillRect(x, y, 12 * scale, 24 * scale);
      tree.fillStyle(0x4caf50, 1);
      tree.fillCircle(x + 6 * scale, y - 4 * scale, 16 * scale);
      tree.fillCircle(x - 8 * scale, y + 6 * scale, 14 * scale);
      tree.fillCircle(x + 20 * scale, y + 6 * scale, 14 * scale);
    }

    function create() {
      const width = this.scale.width;
      const height = this.scale.height;

      const treeLayouts = {
        monza: [
          { x: 70, y: 70 },
          { x: 180, y: 20 },
          { x: 330, y: 10 },
          { x: 650, y: 70 },
          { x: 820, y: 70 },
          { x: 1180, y: 80 },
          { x: 1120, y: 180 },
          { x: 70, y: 520 },
          { x: 60, y: 320 },
          { x: 330, y: 240 },
          { x: 390, y: 390 },
          { x: 1130, y: 240 },
        ],
        melbourne: [
          { x: 380, y: 20 },
          { x: 440, y: 80 },
          { x: 35, y: 570 },
          { x: 1120, y: 170 },
          { x: 1180, y: 80 },
          { x: 980, y: 20 },
          { x: 660, y: 400 },
          { x: 690, y: 440 },
          { x: 800, y: 420 },
          { x: 840, y: 300 },
          { x: 780, y: 290 },
          { x: 660, y: 180 },
        ],
        singapore: [
          { x: 30, y: 30 },
          { x: 30, y: 150 },
          { x: 60, y: 570 },
          { x: 390, y: 30 },
          { x: 210, y: 620 },
          { x: 260, y: 600 },
          { x: 1130, y: 30 },
          { x: 890, y: 60 },
          { x: 740, y: 80 },
          { x: 1160, y: 570 },
          { x: 1200, y: 420 },
          { x: 1190, y: 240 },
        ],
        miami: [
          { x: 70, y: 70 },
          { x: 220, y: 50 },
          { x: 40, y: 140 },
          { x: 30, y: 90 },
          { x: 20, y: 270 },
          { x: 1120, y: 70 },
          { x: 1090, y: 30 },
          { x: 890, y: 50 },
          { x: 810, y: 20 },
          { x: 20, y: 610 },
          { x: 60, y: 590 },
          { x: 60, y: 290 },
        ],
        british: [
          { x: 70, y: 50 },
          { x: 270, y: 210 },
          { x: 330, y: 200 },
          { x: 480, y: 240 },
          { x: 510, y: 180 },
          { x: 80, y: 620 },
          { x: 60, y: 570 },
          { x: 1120, y: 30 },
          { x: 840, y: 60 },
          { x: 830, y: 470 },
          { x: 1050, y: 290 },
          { x: 1000, y: 330 },
        ],
        belgian: [
          { x: 60, y: 70 },
          { x: 180, y: 150 },
          { x: 390, y: 90 },
          { x: 330, y: 80 },
          { x: 530, y: 60 },
          { x: 80, y: 240 },
          { x: 530, y: 360 },
          { x: 630, y: 250 },
          { x: 690, y: 450 },
          { x: 1190, y: 420 },
          { x: 400, y: 600 },
          { x: 470, y: 620 },
        ],
        austria: [
          { x: 70, y: 70 },
          { x: 250, y: 30 },
          { x: 480, y: 50 },
          { x: 70, y: 260 },
          { x: 690, y: 70 },
          { x: 60, y: 560 },
          { x: 120, y: 590 },
          { x: 1110, y: 90 },
          { x: 1120, y: 250 },
          { x: 1120, y: 620 },
          { x: 1000, y: 570 },
          { x: 410, y: 210 },
        ],
        monaco: [
          { x: 60, y: 80 },
          { x: 500, y: 80 },
          { x: 780, y: 206 },
          { x: 200, y: 80 },
          { x: 70, y: 300 },
          { x: 1110, y: 80 },
          { x: 1190, y: 60 },
          { x: 1120, y: 282 },
          { x: 1000, y: 590 },
          { x: 1120, y: 600 },
          { x: 920, y: 570 },
          { x: 390, y: 570 },
        ],
        hungary: [
          { x: 30, y: 70 },
          { x: 470, y: 26 },
          { x: 470, y: 260 },
          { x: 590, y: 290 },
          { x: 1090, y: 50 },
          { x: 1160, y: 80 },
          { x: 60, y: 500 },
          { x: 660, y: 330 },
          { x: 638, y: 270 },
          { x: 980, y: 490 },
          { x: 57, y: 290 },
          { x: 740, y: 470 },
        ],
        lasvegas: [
          { x: 30, y: 70 },
          { x: 50, y: 180 },
          { x: 30, y: 510 },
          { x: 70, y: 590 },
          { x: 390, y: 300 },
          { x: 420, y: 350 },
          { x: 900, y: 400 },
          { x: 960, y: 390 },
          { x: 1080, y: 260 },
          { x: 1170, y: 30 },
          { x: 600, y: 170 },
          { x: 750, y: 480 },
        ],
        qatar: [
          { x: 20, y: 90 },
          { x: 750, y: 180 },
          { x: 330, y: 30 },
          { x: 660, y: 50 },
          { x: 790, y: 90 },
          { x: 390, y: 626 },
          { x: 1150, y: 619 },
          { x: 1140, y: 318 },
          { x: 480, y: 330 },
          { x: 390, y: 426 },
          { x: 60, y: 620 },
          { x: 180, y: 610 },
        ],
        abudhabi: [
          { x: 60, y: 70 },
          { x: 160, y: 120 },
          { x: 360, y: 240 },
          { x: 390, y: 290 },
          { x: 220, y: 70 },
          { x: 530, y: 30 },
          { x: 1190, y: 150 },
          { x: 1090, y: 350 },
          { x: 1200, y: 380 },
          { x: 800, y: 380 },
          { x: 750, y: 480 },
          { x: 930, y: 570 },
        ],
      };
      const trees = treeLayouts[selectedTrack] || [];

      trees.forEach((tree) => {
        drawTree(this, tree.x, tree.y, Phaser.Math.FloatBetween(0.8, 1.3));
      });

      const road = this.add.graphics();

      lights = [];
      raceStarted = false;
      raceFinished = false;

      p1Lap = 0;
      p2Lap = 0;

      p1PassedCheckpoint = false;
      p2PassedCheckpoint = false;

      p1CanCountLap = false;
      p2CanCountLap = false;

      raceStartedMoving = false;

      road.fillStyle(0xfae596, 1);
      road.fillEllipse(width * 0.18, height * 0.62, 260, 320);
      road.fillEllipse(width * 0.8, height * 0.22, 220, 160);
      road.fillEllipse(width * 0.5, height * 0.84, 300, 150);

      let trackCurve;

      if (selectedTrack === "monza") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.42, height * 0.84),
          new Phaser.Math.Vector2(width * 0.58, height * 0.84),
          new Phaser.Math.Vector2(width * 0.78, height * 0.84),
          new Phaser.Math.Vector2(width * 0.9, height * 0.82),
          new Phaser.Math.Vector2(width * 0.95, height * 0.74),
          new Phaser.Math.Vector2(width * 0.95, height * 0.64),
          new Phaser.Math.Vector2(width * 0.9, height * 0.56),
          new Phaser.Math.Vector2(width * 0.74, height * 0.56),
          new Phaser.Math.Vector2(width * 0.58, height * 0.56),
          new Phaser.Math.Vector2(width * 0.5, height * 0.5),
          new Phaser.Math.Vector2(width * 0.42, height * 0.38),
          new Phaser.Math.Vector2(width * 0.32, height * 0.22),
          new Phaser.Math.Vector2(width * 0.2, height * 0.2),
          new Phaser.Math.Vector2(width * 0.14, height * 0.28),
          new Phaser.Math.Vector2(width * 0.16, height * 0.44),
          new Phaser.Math.Vector2(width * 0.18, height * 0.64),
          new Phaser.Math.Vector2(width * 0.22, height * 0.78),
          new Phaser.Math.Vector2(width * 0.3, height * 0.84),
          new Phaser.Math.Vector2(width * 0.42, height * 0.84),
        ]);
      } else if (selectedTrack === "melbourne") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.44, height * 0.84),
          new Phaser.Math.Vector2(width * 0.6, height * 0.84),
          new Phaser.Math.Vector2(width * 0.76, height * 0.84),
          new Phaser.Math.Vector2(width * 0.88, height * 0.82),
          new Phaser.Math.Vector2(width * 0.94, height * 0.74),
          new Phaser.Math.Vector2(width * 0.96, height * 0.62),
          new Phaser.Math.Vector2(width * 0.92, height * 0.48),
          new Phaser.Math.Vector2(width * 0.82, height * 0.36),
          new Phaser.Math.Vector2(width * 0.68, height * 0.3),
          new Phaser.Math.Vector2(width * 0.56, height * 0.34),
          new Phaser.Math.Vector2(width * 0.5, height * 0.48),
          new Phaser.Math.Vector2(width * 0.4, height * 0.48),
          new Phaser.Math.Vector2(width * 0.3, height * 0.3),
          new Phaser.Math.Vector2(width * 0.22, height * 0.1),
          new Phaser.Math.Vector2(width * 0.12, height * 0.12),
          new Phaser.Math.Vector2(width * 0.07, height * 0.3),
          new Phaser.Math.Vector2(width * 0.05, height * 0.56),
          new Phaser.Math.Vector2(width * 0.1, height * 0.76),
          new Phaser.Math.Vector2(width * 0.22, height * 0.84),
          new Phaser.Math.Vector2(width * 0.44, height * 0.84),
        ]);
      } else if (selectedTrack === "singapore") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.9, height * 0.7),
          new Phaser.Math.Vector2(width * 0.9, height * 0.28),
          new Phaser.Math.Vector2(width * 0.85, height * 0.22),
          new Phaser.Math.Vector2(width * 0.81, height * 0.15),
          new Phaser.Math.Vector2(width * 0.77, height * 0.3),
          new Phaser.Math.Vector2(width * 0.8, height * 0.55),
          new Phaser.Math.Vector2(width * 0.6, height * 0.35),
          new Phaser.Math.Vector2(width * 0.42, height * 0.16),
          new Phaser.Math.Vector2(width * 0.3, height * 0.28),
          new Phaser.Math.Vector2(width * 0.24, height * 0.12),
          new Phaser.Math.Vector2(width * 0.06, height * 0.38),
          new Phaser.Math.Vector2(width * 0.1, height * 0.48),
          new Phaser.Math.Vector2(width * 0.06, height * 0.58),
          new Phaser.Math.Vector2(width * 0.14, height * 0.78),
          new Phaser.Math.Vector2(width * 0.38, height * 0.45),
          new Phaser.Math.Vector2(width * 0.44, height * 0.55),
          new Phaser.Math.Vector2(width * 0.49, height * 0.59),
          new Phaser.Math.Vector2(width * 0.54, height * 0.82),
          new Phaser.Math.Vector2(width * 0.63, height * 0.68),
          new Phaser.Math.Vector2(width * 0.74, height * 0.75),
          new Phaser.Math.Vector2(width * 0.7, height * 0.86),
          new Phaser.Math.Vector2(width * 0.82, height * 0.92),
          new Phaser.Math.Vector2(width * 0.88, height * 0.85), 
          new Phaser.Math.Vector2(width * 0.9, height * 0.7),
        ]);
      } else if (selectedTrack === "miami") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.56, height * 0.38),
          new Phaser.Math.Vector2(width * 0.56, height * 0.38),
          new Phaser.Math.Vector2(width * 0.72, height * 0.46),
          new Phaser.Math.Vector2(width * 0.62, height * 0.56),
          new Phaser.Math.Vector2(width * 0.66, height * 0.68),
          new Phaser.Math.Vector2(width * 0.48, height * 0.61),
          new Phaser.Math.Vector2(width * 0.35, height * 0.68),
          new Phaser.Math.Vector2(width * 0.18, height * 0.58),
          new Phaser.Math.Vector2(width * 0.05, height * 0.71),
          new Phaser.Math.Vector2(width * 0.12, height * 0.82),
          new Phaser.Math.Vector2(width * 0.35, height * 0.86),
          new Phaser.Math.Vector2(width * 0.65, height * 0.88),
          new Phaser.Math.Vector2(width * 0.92, height * 0.78),
          new Phaser.Math.Vector2(width * 0.86, height * 0.68),
          new Phaser.Math.Vector2(width * 0.95, height * 0.58),
          new Phaser.Math.Vector2(width * 0.88, height * 0.48),
          new Phaser.Math.Vector2(width * 0.96, height * 0.38),
          new Phaser.Math.Vector2(width * 0.9, height * 0.26),
          new Phaser.Math.Vector2(width * 0.5, height * 0.22),
          new Phaser.Math.Vector2(width * 0.18, height * 0.22),
          new Phaser.Math.Vector2(width * 0.12, height * 0.28),
          new Phaser.Math.Vector2(width * 0.24, height * 0.36),
          new Phaser.Math.Vector2(width * 0.38, height * 0.32),
          new Phaser.Math.Vector2(width * 0.56, height * 0.38),
        ]);
      } else if (selectedTrack === "british") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.58, height * 0.12),
          new Phaser.Math.Vector2(width * 0.62, height * 0.24),
          new Phaser.Math.Vector2(width * 0.58, height * 0.36),
          new Phaser.Math.Vector2(width * 0.54, height * 0.46),
          new Phaser.Math.Vector2(width * 0.46, height * 0.56),
          new Phaser.Math.Vector2(width * 0.54, height * 0.64),
          new Phaser.Math.Vector2(width * 0.78, height * 0.34),
          new Phaser.Math.Vector2(width * 0.86, height * 0.18),
          new Phaser.Math.Vector2(width * 0.94, height * 0.3),
          new Phaser.Math.Vector2(width * 0.92, height * 0.78),
          new Phaser.Math.Vector2(width * 0.7, height * 0.9),
          new Phaser.Math.Vector2(width * 0.58, height * 0.86),
          new Phaser.Math.Vector2(width * 0.46, height * 0.9),
          new Phaser.Math.Vector2(width * 0.34, height * 0.88),
          new Phaser.Math.Vector2(width * 0.22, height * 0.82),
          new Phaser.Math.Vector2(width * 0.08, height * 0.52),
          new Phaser.Math.Vector2(width * 0.06, height * 0.3),
          new Phaser.Math.Vector2(width * 0.18, height * 0.16),
          new Phaser.Math.Vector2(width * 0.28, height * 0.08),
          new Phaser.Math.Vector2(width * 0.42, height * 0.1),
          new Phaser.Math.Vector2(width * 0.58, height * 0.12),
          new Phaser.Math.Vector2(width * 0.62, height * 0.24),
          new Phaser.Math.Vector2(width * 0.58, height * 0.36),
        ]);
      } else if (selectedTrack === "belgian") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.4, height * 0.7),
          new Phaser.Math.Vector2(width * 0.15, height * 0.9),
          new Phaser.Math.Vector2(width * 0.05, height * 0.8),
          new Phaser.Math.Vector2(width * 0.15, height * 0.65),
          new Phaser.Math.Vector2(width * 0.25, height * 0.45),
          new Phaser.Math.Vector2(width * 0.35, height * 0.35),
          new Phaser.Math.Vector2(width * 0.45, height * 0.28),
          new Phaser.Math.Vector2(width * 0.65, height * 0.15),
          new Phaser.Math.Vector2(width * 0.82, height * 0.08),
          new Phaser.Math.Vector2(width * 0.95, height * 0.12),
          new Phaser.Math.Vector2(width * 0.88, height * 0.22),
          new Phaser.Math.Vector2(width * 0.98, height * 0.35),
          new Phaser.Math.Vector2(width * 0.9, height * 0.45),
          new Phaser.Math.Vector2(width * 0.7, height * 0.4),
          new Phaser.Math.Vector2(width * 0.6, height * 0.55),
          new Phaser.Math.Vector2(width * 0.78, height * 0.65),
          new Phaser.Math.Vector2(width * 0.9, height * 0.75),
          new Phaser.Math.Vector2(width * 0.95, height * 0.85),
          new Phaser.Math.Vector2(width * 0.8, height * 0.95),
          new Phaser.Math.Vector2(width * 0.6, height * 0.9),
          new Phaser.Math.Vector2(width * 0.45, height * 0.82),
          new Phaser.Math.Vector2(width * 0.4, height * 0.75),
          new Phaser.Math.Vector2(width * 0.35, height * 0.7),
          new Phaser.Math.Vector2(width * 0.4, height * 0.7),
          new Phaser.Math.Vector2(width * 0.15, height * 0.9),
          new Phaser.Math.Vector2(width * 0.05, height * 0.8),
        ]);
      } else if (selectedTrack === "austria") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.65, height * 0.75),
          new Phaser.Math.Vector2(width * 0.45, height * 0.82),
          new Phaser.Math.Vector2(width * 0.32, height * 0.65),
          new Phaser.Math.Vector2(width * 0.34, height * 0.58),
          new Phaser.Math.Vector2(width * 0.12, height * 0.2),
          new Phaser.Math.Vector2(width * 0.65, height * 0.25),
          new Phaser.Math.Vector2(width * 0.55, height * 0.35),
          new Phaser.Math.Vector2(width * 0.42, height * 0.42),
          new Phaser.Math.Vector2(width * 0.45, height * 0.55),
          new Phaser.Math.Vector2(width * 0.52, height * 0.52),
          new Phaser.Math.Vector2(width * 0.9, height * 0.5),
          new Phaser.Math.Vector2(width * 0.92, height * 0.65),
          new Phaser.Math.Vector2(width * 0.65, height * 0.75),
          new Phaser.Math.Vector2(width * 0.45, height * 0.82),
        ]);
      } else if (selectedTrack === "monaco") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.15, height * 0.65),
          new Phaser.Math.Vector2(width * 0.35, height * 0.25),
          new Phaser.Math.Vector2(width * 0.5, height * 0.35),
          new Phaser.Math.Vector2(width * 0.65, height * 0.45),
          new Phaser.Math.Vector2(width * 0.8, height * 0.35),
          new Phaser.Math.Vector2(width * 0.95, height * 0.3),
          new Phaser.Math.Vector2(width * 0.98, height * 0.5),
          new Phaser.Math.Vector2(width * 0.85, height * 0.6),
          new Phaser.Math.Vector2(width * 0.65, height * 0.65),
          new Phaser.Math.Vector2(width * 0.5, height * 0.6),
          new Phaser.Math.Vector2(width * 0.45, height * 0.5),
          new Phaser.Math.Vector2(width * 0.25, height * 0.55),
          new Phaser.Math.Vector2(width * 0.15, height * 0.65),
          new Phaser.Math.Vector2(width * 0.05, height * 0.8),
          new Phaser.Math.Vector2(width * 0.1, height * 0.95),
          new Phaser.Math.Vector2(width * 0.15, height * 0.65),
        ]);
      } else if (selectedTrack === "hungary") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.2, height * 0.95),
          new Phaser.Math.Vector2(width * 0.6, height * 0.95),
          new Phaser.Math.Vector2(width * 0.9, height * 0.95),
          new Phaser.Math.Vector2(width * 0.9, height * 0.6),
          new Phaser.Math.Vector2(width * 0.9, height * 0.3),
          new Phaser.Math.Vector2(width * 0.75, height * 0.25),
          new Phaser.Math.Vector2(width * 0.55, height * 0.1),
          new Phaser.Math.Vector2(width * 0.35, height * 0.2),
          new Phaser.Math.Vector2(width * 0.3, height * 0.1),
          new Phaser.Math.Vector2(width * 0.2, height * 0.05),
          new Phaser.Math.Vector2(width * 0.1, height * 0.15),
          new Phaser.Math.Vector2(width * 0.15, height * 0.4),
          new Phaser.Math.Vector2(width * 0.35, height * 0.6),
          new Phaser.Math.Vector2(width * 0.45, height * 0.75),
          new Phaser.Math.Vector2(width * 0.25, height * 0.75),
          new Phaser.Math.Vector2(width * 0.1, height * 0.95),
          new Phaser.Math.Vector2(width * 0.2, height * 0.95),
        ]);
      } else if (selectedTrack === "lasvegas") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.9, height * 0.25),
          new Phaser.Math.Vector2(width * 0.82, height * 0.18),
          new Phaser.Math.Vector2(width * 0.82, height * 0.1),
          new Phaser.Math.Vector2(width * 0.82, height * 0.04),
          new Phaser.Math.Vector2(width * 0.7, height * 0.12),
          new Phaser.Math.Vector2(width * 0.4, height * 0.12),
          new Phaser.Math.Vector2(width * 0.3, height * 0.08),
          new Phaser.Math.Vector2(width * 0.22, height * 0.06),
          new Phaser.Math.Vector2(width * 0.15, height * 0.08),
          new Phaser.Math.Vector2(width * 0.12, height * 0.12),
          new Phaser.Math.Vector2(width * 0.12, height * 0.45),
          new Phaser.Math.Vector2(width * 0.08, height * 0.58),
          new Phaser.Math.Vector2(width * 0.08, height * 0.68),
          new Phaser.Math.Vector2(width * 0.35, height * 0.88),
          new Phaser.Math.Vector2(width * 0.83, height * 0.88),
          new Phaser.Math.Vector2(width * 0.9, height * 0.86),
          new Phaser.Math.Vector2(width * 0.95, height * 0.78),
          new Phaser.Math.Vector2(width * 0.96, height * 0.55),
          new Phaser.Math.Vector2(width * 0.96, height * 0.32),
          new Phaser.Math.Vector2(width * 0.92, height * 0.25),
          new Phaser.Math.Vector2(width * 0.85, height * 0.22),
        ]);
      } else if (selectedTrack === "qatar") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.18, height * 0.76),
          new Phaser.Math.Vector2(width * 0.1, height * 0.72),
          new Phaser.Math.Vector2(width * 0.07, height * 0.7),
          new Phaser.Math.Vector2(width * 0.07, height * 0.6),
          new Phaser.Math.Vector2(width * 0.1, height * 0.52),
          new Phaser.Math.Vector2(width * 0.18, height * 0.45),
          new Phaser.Math.Vector2(width * 0.1, height * 0.18), // T4
          new Phaser.Math.Vector2(width * 0.18, height * 0.12), // T5
          new Phaser.Math.Vector2(width * 0.28, height * 0.4), // T6
          new Phaser.Math.Vector2(width * 0.36, height * 0.1), // T7
          new Phaser.Math.Vector2(width * 0.46, height * 0.22), // T8
          new Phaser.Math.Vector2(width * 0.52, height * 0.38), // T9
          new Phaser.Math.Vector2(width * 0.48, height * 0.54), // T10
          new Phaser.Math.Vector2(width * 0.66, height * 0.48), // T11
          new Phaser.Math.Vector2(width * 0.76, height * 0.12), // T12
          new Phaser.Math.Vector2(width * 0.88, height * 0.12), // T13
          new Phaser.Math.Vector2(width * 0.92, height * 0.3), // T14
          new Phaser.Math.Vector2(width * 0.8, height * 0.56), // T15
          new Phaser.Math.Vector2(width * 0.9, height * 0.78), // T16
          new Phaser.Math.Vector2(width * 0.6, height * 0.8),
          new Phaser.Math.Vector2(width * 0.3, height * 0.8),
          new Phaser.Math.Vector2(width * 0.12, height * 0.74),
        ]);
      } else if (selectedTrack === "abudhabi") {
        trackCurve = new Phaser.Curves.Spline([
          new Phaser.Math.Vector2(width * 0.48, height * 0.68),
          new Phaser.Math.Vector2(width * 0.56, height * 0.58),
          new Phaser.Math.Vector2(width * 0.58, height * 0.42),
          new Phaser.Math.Vector2(width * 0.7, height * 0.32),
          new Phaser.Math.Vector2(width * 0.82, height * 0.2),
          new Phaser.Math.Vector2(width * 0.94, height * 0.08),
          new Phaser.Math.Vector2(width * 0.92, height * 0.06),
          new Phaser.Math.Vector2(width * 0.75, height * 0.1),
          new Phaser.Math.Vector2(width * 0.55, height * 0.14),
          new Phaser.Math.Vector2(width * 0.35, height * 0.2),
          new Phaser.Math.Vector2(width * 0.2, height * 0.28),
          new Phaser.Math.Vector2(width * 0.1, height * 0.42),
          new Phaser.Math.Vector2(width * 0.06, height * 0.7),
          new Phaser.Math.Vector2(width * 0.08, height * 0.92),
          new Phaser.Math.Vector2(width * 0.16, height * 0.96),
          new Phaser.Math.Vector2(width * 0.24, height * 0.86),
          new Phaser.Math.Vector2(width * 0.18, height * 0.74),
          new Phaser.Math.Vector2(width * 0.22, height * 0.62),
          new Phaser.Math.Vector2(width * 0.28, height * 0.72),
          new Phaser.Math.Vector2(width * 0.38, height * 0.66),
          new Phaser.Math.Vector2(width * 0.45, height * 0.68),
          new Phaser.Math.Vector2(width * 0.5, height * 0.7),
          new Phaser.Math.Vector2(width * 0.48, height * 0.68),
          new Phaser.Math.Vector2(width * 0.48, height * 0.68),
        ]);
      }
      trackPoints = trackCurve.getSpacedPoints(1000);

      const isSingapore = selectedTrack === "singapore";
      const isAustria = selectedTrack === "austria";
      const isMonaco = selectedTrack === "monaco";
      const isLasVegas = selectedTrack === "lasvegas";
      const isAbuDhabi = selectedTrack === "abudhabi";

      let greyWidth, whiteWidth, rumbleWidth;

      if (isSingapore) {
        greyWidth = 86;
        whiteWidth = 92;
        rumbleWidth = 112;
      } else if (isAustria) {
        greyWidth = 72;
        whiteWidth = 83;
        rumbleWidth = 105;
      } else if (isMonaco) {
        greyWidth = 81;
        whiteWidth = 90;
        rumbleWidth = 102;
      } else if (isLasVegas) {
        greyWidth = 100;
        whiteWidth = 106;
        rumbleWidth = 126;
      } else if (isAbuDhabi) {
        greyWidth = 80;
        whiteWidth = 92;
        rumbleWidth = 112;
      } else {
        greyWidth = 100;
        whiteWidth = 106;
        rumbleWidth = 126;
      }

      const resolution = isAbuDhabi ? 800 : 500;
      trackPoints = trackCurve.getSpacedPoints(isAbuDhabi ? 1500 : 1000);
      const renderPoints = trackCurve.getSpacedPoints(resolution);
      const isCorner = new Array(resolution).fill(false);
      const lookAhead = 15;

      for (let i = 0; i < resolution - lookAhead; i++) {
        const p1 = renderPoints[i];
        const p2 = renderPoints[i + lookAhead];
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        if (i >= lookAhead) {
          const p0 = renderPoints[i - lookAhead];
          const angle0 = Math.atan2(p1.y - p0.y, p1.x - p0.x);
          const diff = Math.abs(Phaser.Math.Angle.Wrap(angle1 - angle0));
          if (diff > 0.05) {
            isCorner[i] = true;
          }
        }
      }
      const kerbZones = new Array(resolution).fill(false);
      const expansion = 15;
      for (let i = 0; i < resolution; i++) {
        if (isCorner[i]) {
          for (
            let j = Math.max(0, i - expansion);
            j <= Math.min(resolution - 1, i + expansion);
            j++
          ) {
            kerbZones[j] = true;
          }
        }
      }
      const blockLength = 12;
      road.lineStyle(rumbleWidth, 0xe53935, 1);
      road.beginPath();
      let drawingRed = false;
      for (let i = 0; i < resolution; i++) {
        if (kerbZones[i]) {
          if (!drawingRed) {
            road.moveTo(renderPoints[i].x, renderPoints[i].y);
            drawingRed = true;
          } else {
            road.lineTo(renderPoints[i].x, renderPoints[i].y);
          }
        } else {
          if (drawingRed) road.strokePath();
          drawingRed = false;
        }
      }
      if (drawingRed) road.strokePath();
      road.lineStyle(rumbleWidth, 0xffffff, 1);
      road.beginPath();
      let drawingWhite = false;
      for (let i = 0; i < resolution; i++) {
        if (kerbZones[i] && Math.floor(i / blockLength) % 2 === 0) {
          if (!drawingWhite) {
            road.moveTo(renderPoints[i].x, renderPoints[i].y);
            drawingWhite = true;
          } else {
            road.lineTo(renderPoints[i].x, renderPoints[i].y);
          }
        } else {
          if (drawingWhite) road.strokePath();
          drawingWhite = false;
        }
      }
      if (drawingWhite) road.strokePath();
      road.lineStyle(whiteWidth, 0xffffff, 1);
      trackCurve.draw(road, resolution);
      road.lineStyle(greyWidth, 0x8f8f8f, 1);
      trackCurve.draw(road, resolution);

      menuButton = this.add
        .text(20, 12, "☰ MENU", {
          fontSize: "22px",
          fontStyle: "bold",
          backgroundColor: "#111111",
          color: "#ffffff",
          padding: {
            x: 14,
            y: 8,
          },
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setInteractive({ useHandCursor: true });
      menuPanel = this.add.container(20, 55);
      menuPanel.setVisible(false);

      const panelBg = this.add
        .rectangle(95, 90, 190, 170, 0x111111, 0.92)
        .setStrokeStyle(3, 0xffd54f);

      const resumeIcon = this.add
        .text(45, 40, "▶️", {
          fontSize: "24px",
        })
        .setOrigin(0.5);

      resumeBtn = this.add
        .text(75, 40, "RESUME", {
          fontSize: "22px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

      const restartIcon = this.add
        .text(45, 90, "🔁", {
          fontSize: "24px",
        })
        .setOrigin(0.5);

      restartMenuBtn = this.add
        .text(75, 90, "RESTART", {
          fontSize: "22px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

      const quitIcon = this.add
        .text(45, 140, "❌", {
          fontSize: "24px",
        })
        .setOrigin(0.5);

      quitBtn = this.add
        .text(75, 140, "QUIT", {
          fontSize: "22px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

      menuPanel.add([
        panelBg,
        resumeIcon,
        resumeBtn,
        restartIcon,
        restartMenuBtn,
        quitIcon,
        quitBtn,
      ]);

      menuButton.on("pointerdown", () => {
        menuOpen = !menuOpen;
        menuPanel.setVisible(menuOpen);

        if (menuOpen) {
          this.physics.pause();
          engineRunAudio?.pause();
          idleEngineAudio?.pause();
          controlAudio?.pause();
        }
      });

      resumeBtn.on("pointerdown", () => {
        menuOpen = false;
        menuPanel.setVisible(false);
        this.physics.resume();

        if (raceStarted && !raceFinished) {
          if (p1.body.speed > 8 || p2.body.speed > 8) {
            if (!engineRunAudio.isPlaying) engineRunAudio.play();
          } else {
            if (!idleEngineAudio.isPlaying) idleEngineAudio.play();
          }
        }
      });

      restartMenuBtn.on("pointerdown", () => {
        countdownRoarAudio?.stop();
        engineRunAudio?.stop();
        idleEngineAudio?.stop();
        controlAudio?.stop();
        crashAudio?.stop();
        beepAudio?.stop();

        lights.forEach((light) => light.destroy());

        p1Lap = 0;
        p2Lap = 0;
        p1PassedCheckpoint = false;
        p2PassedCheckpoint = false;
        p1CanCountLap = false;
        p2CanCountLap = false;
        raceStarted = false;
        raceFinished = false;
        raceStartedMoving = false;
        this.scene.restart();
      });

      quitBtn.on("pointerdown", () => {
        onQuit();
      });

      menuPanel.setDepth(1000);
      menuButton.setDepth(1000);
      if (selectedTrack === "monza") {
        road.fillStyle(0x8f8f8f, 1);
        road.fillRect(width * 0.416, height * 0.769, 6, 40);
      }
      if (selectedTrack === "melbourne") {
        road.fillStyle(0x8f8f8f, 1);
        road.fillRect(width * 0.439, height * 0.766, 6, 40);
      }
      if (selectedTrack === "hungary") {
        road.fillStyle(0x8f8f8f, 1);
        road.fillRect(width * 0.199, height * 0.88, 6, 40);
      }

      let finishX;
      let finishY;
      if (selectedTrack === "singapore") {
        finishX = width * 0.9;
        finishY = height * 0.71;
      } else if (selectedTrack === "melbourne") {
        finishX = width * 0.72;
        finishY = height * 0.82;
      } else if (selectedTrack === "miami") {
        finishX = width * 0.56;
        finishY = height * 0.36;
      } else if (selectedTrack === "british") {
        finishX = width * 0.38;
        finishY = height * 0.07;
      } else if (selectedTrack === "belgian") {
        finishX = width * 0.24;
        finishY = height * 0.82;
      } else if (selectedTrack === "austria") {
        finishX = width * 0.63;
        finishY = height * 0.74;
      } else if (selectedTrack === "monaco") {
        finishX = width * 0.33;
        finishY = height * 0.26;
      } else if (selectedTrack === "hungary") {
        finishX = width * 0.79;
        finishY = height * 0.94;
      } else if (selectedTrack === "lasvegas") {
        finishX = width * 0.66;
        finishY = height * 0.11;
      } else if (selectedTrack === "qatar") {
        finishX = width * 0.42;
        finishY = height * 0.78;
      } else if (selectedTrack === "abudhabi") {
        finishX = width * 0.5;
        finishY = height * 0.66;
      } else {
        finishX = width * 0.75;
        finishY = height * 0.82;
      }
      const tileSize = 9;
      let lineAngle = 90;

      if (selectedTrack === "singapore") {
        lineAngle = 0;
      }
      if (selectedTrack === "singapore") {
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 11; col++) {
            const tile = this.add.rectangle(
              finishX - 48 + col * tileSize,
              finishY + row * tileSize - 8,
              tileSize,
              tileSize,
              (row + col) % 2 === 0 ? 0xffffff : 0x000000,
            );

            tile.setAngle(0);
          }
        }
      } else {
        this.add
          .rectangle(finishX, finishY, 14, greyWidth, 0x8f8f8f)
          .setAngle(lineAngle);

        for (let row = 0; row < 11; row++) {
          for (let col = 0; col < 2; col++) {
            const tile = this.add.rectangle(
              finishX + col * tileSize - 8,
              finishY - 30 + row * tileSize,
              tileSize,
              tileSize,
              (row + col) % 2 === 0 ? 0xffffff : 0x000000,
            );
            tile.setAngle(lineAngle);
          }
        }
      }
      const spawnPositions = {
        monza: {
          p1x: width * 0.8,
          p1y: height * 0.8,
          p2x: width * 0.8,
          p2y: height * 0.88,
        },
        melbourne: {
          p1x: width * 0.77,
          p1y: height * 0.8,
          p2x: width * 0.77,
          p2y: height * 0.88,
        },
        singapore: {
          p1x: width * 0.87,
          p1y: height * 0.76,
          p2x: width * 0.92,
          p2y: height * 0.76,
        },
        miami: {
          p1x: width * 0.5,
          p1y: height * 0.33,
          p2x: width * 0.5,
          p2y: height * 0.39,
        },
        british: {
          p1x: width * 0.32,
          p1y: height * 0.06,
          p2x: width * 0.32,
          p2y: height * 0.12,
        },
        belgian: {
          p1x: width * 0.3,
          p1y: height * 0.75,
          p2x: width * 0.3,
          p2y: height * 0.83,
        },
        austria: {
          p1x: width * 0.68,
          p1y: height * 0.71,
          p2x: width * 0.68,
          p2y: height * 0.76,
        },
        monaco: {
          p1x: width * 0.28,
          p1y: height * 0.31,
          p2x: width * 0.29,
          p2y: height * 0.37,
        },
        hungary: {
          p1x: width * 0.83,
          p1y: height * 0.92,
          p2x: width * 0.83,
          p2y: height * 0.97,
        },
        lasvegas: {
          p1x: width * 0.71,
          p1y: height * 0.08,
          p2x: width * 0.71,
          p2y: height * 0.15,
        },
        qatar: {
          p1x: width * 0.47,
          p1y: height * 0.76,
          p2x: width * 0.47,
          p2y: height * 0.84,
        },
        abudhabi: {
          p1x: width * 0.45,
          p1y: height * 0.64,
          p2x: width * 0.45,
          p2y: height * 0.71,
        },
      };
      const spawn = spawnPositions[selectedTrack];
      p1 = this.physics.add.image(spawn.p1x, spawn.p1y, "p1car");
      p2 = this.physics.add.image(spawn.p2x, spawn.p2y, "p2car");
      this.physics.add.collider(
        p1,
        p2,
        () => {
          const now = this.time.now;
          if (now - lastCrashTime < 500) return;
          lastCrashTime = now;
          crashAudio.play();
          this.cameras.main.shake(180, 0.008);
          const impactX = (p1.x + p2.x) / 2;
          const impactY = (p1.y + p2.y) / 2;

          for (let i = 0; i < 14; i++) {
            const spark = this.add.circle(
              impactX,
              impactY,
              Phaser.Math.Between(2, 4),
              0xffd54f,
            );

            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const speed = Phaser.Math.Between(80, 180);

            this.tweens.add({
              targets: spark,
              x: impactX + Math.cos(angle) * speed,
              y: impactY + Math.sin(angle) * speed,
              alpha: 0,
              duration: 350,
              onComplete: () => spark.destroy(),
            });
          }
        },
        null,
        this,
      );

      p1.setScale(0.2);
      p2.setScale(0.2);
      p1.body.setSize(p1.width * 0.45, p1.height * 0.45);
      p2.body.setSize(p2.width * 0.45, p2.height * 0.45);
      p1.body.setOffset(p1.width * 0.28, p1.height * 0.28);
      p2.body.setOffset(p2.width * 0.28, p2.height * 0.28);

      if (selectedTrack === "monza") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else if (selectedTrack === "melbourne") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else if (selectedTrack === "singapore") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else if (selectedTrack === "lasvegas") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else if (selectedTrack === "belgian") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else if (selectedTrack === "austria") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else if (selectedTrack === "hungary") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else if (selectedTrack === "qatar") {
        p1.setFlipX(false);
        p2.setFlipX(false);
      } else {
        p1.setFlipX(true);
        p2.setFlipX(true);
      }

      [p1, p2].forEach((car) => {
        car.setCollideWorldBounds(true);
        car.setBounce(0.2);
        car.setMass(0.6);
        car.setDrag(0.93);
        car.setMaxVelocity(400);
      });

      p1.setScale(0.2);
      p2.setScale(0.2);
      [p1, p2].forEach((car) => {
        car.setCollideWorldBounds(true);
        car.setBounce(0.05);
        car.setMass(0.6);
        car.setMaxVelocity(400);
      });

      keys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      });

      cursors = this.input.keyboard.createCursorKeys();

      countdownRoarAudio = this.sound.add("countdownRoar", {
        volume: 0.45,
      });

      engineRunAudio = this.sound.add("engineRun", {
        volume: 0.22,
        loop: true,
      });

      controlAudio = this.sound.add("controlSound", {
        volume: 0.28,
        loop: true,
      });

      crashAudio = this.sound.add("crash", {
        volume: 0.5,
      });

      beepAudio = this.sound.add("beep", {
        volume: 0.35,
      });

      idleEngineAudio = this.sound.add("idleEngine", {
        volume: 0.12,
        loop: true,
      });

      const gantry = this.add.graphics();
      const gantryX = width / 2 - 120;
      const gantryY = 40;

      gantry.fillStyle(0x111111, 1);
      gantry.fillRoundedRect(gantryX, gantryY, 240, 110, 8);
      gantry.fillStyle(0x2a2a2a, 1);

      for (let i = 1; i < 4; i++) {
        gantry.fillRect(gantryX + i * 60, gantryY, 4, 110);
      }

      for (let col = 0; col < 4; col++) {
        const topLight = this.add.circle(
          gantryX + 32 + col * 60,
          gantryY + 35,
          14,
          0xff0000,
        );

        const bottomLight = this.add.circle(
          gantryX + 32 + col * 60,
          gantryY + 75,
          14,
          0xff0000,
        );
        lights.push(topLight);
        lights.push(bottomLight);
      }

      countdownText = this.add
        .text(width / 2, 21, "GET READY", {
          fontSize: "33px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 6,
        })
        .setOrigin(0.5);

      lapText = this.add.text(
        width - 440,
        20,
        `${player1Name}: 0/${totalLaps}   ${player2Name}: 0/${totalLaps}`,
        {
          fontSize: "24px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        },
      );

      countdownRoarAudio.play();

      this.time.delayedCall(300, () => {
        beepAudio.play();
      });

      this.time.delayedCall(1000, () => {
        lights[6].setFillStyle(0x330000);
        lights[7].setFillStyle(0x330000);
      });

      this.time.delayedCall(2000, () => {
        lights[4].setFillStyle(0x330000);
        lights[5].setFillStyle(0x330000);
      });

      this.time.delayedCall(3000, () => {
        lights[2].setFillStyle(0x330000);
        lights[3].setFillStyle(0x330000);
      });

      this.time.delayedCall(4000, () => {
        lights[0].setFillStyle(0x330000);
        lights[1].setFillStyle(0x330000);
        countdownText.setText("GO!");
        raceStarted = true;
        raceStartedMoving = false;
        p1CanCountLap = false;
        p2CanCountLap = false;
        this.time.delayedCall(1000, () => {
          countdownText.destroy();
          gantry.destroy();
          lights.forEach((light) => light.destroy());
        });
      });
    }

    function declareWinner(scene, player) {
      if (raceFinished) return;

      raceFinished = true;
      raceStarted = false;

      // Keep the result card centered on the screen.
      const resultX = scene.scale.width / 2;
      const resultY = scene.scale.height / 2;

      const winner = player === 1 ? player1Name : player2Name;
      const loser = player === 1 ? player2Name : player1Name;
      const now = new Date();
      const result = {
        track: selectedTrack,
        player1: player1Name || "Player 1",
        player2: player2Name || "Player 2",
        winner:
          player === 1 ? player1Name || "Player 1" : player2Name || "Player 2",
        loser:
          player === 1 ? player2Name || "Player 2" : player1Name || "Player 1",
        date: `${String(now.getDate()).padStart(2, "0")}/${String(
          now.getMonth() + 1,
        ).padStart(2, "0")}/${String(now.getFullYear()).slice(-2)}`,
        time: now.toLocaleTimeString("en-GB"),
      };

      const oldResults = JSON.parse(localStorage.getItem("raceResults")) || [];
      oldResults.push(result);
      localStorage.setItem("raceResults", JSON.stringify(oldResults));

      engineRunAudio.stop();
      idleEngineAudio.stop();
      controlAudio.stop();

      const overlay = scene.add.rectangle(
        resultX,
        resultY,
        scene.scale.width,
        scene.scale.height,
        0x000000,
        0.45,
      );

      // Card stays centred on screen; content block has its own reference point.
      const cardHeight = 410;
      const cardY = resultY;
      const contentY = cardY + 96;
      const resultCard = scene.add.rectangle(
        resultX,
        cardY,
        720,
        cardHeight,
        0x111111,
        0.95,
      );

      scene.add
        .text(resultX, contentY - 250, "🏁 RACE RESULT 🏁", {
          fontSize: "36px",
          fontStyle: "bold",
          color: "#ffd54f",
        })
        .setOrigin(0.5);

      scene.add
        .text(resultX - 180, contentY - 160, selectedTrack.toUpperCase(), {
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      scene.add.text(resultX + 80, contentY - 150, "🏆 WINNER", {
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffd700",
      });

      scene.add.text(resultX + 80, contentY - 110, winner, {
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffffff",
      });

      scene.add.text(resultX + 80, contentY - 40, "❌ LOSER", {
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ff6b6b",
      });

      scene.add.text(resultX + 80, contentY, loser, {
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffffff",
      });

      scene.add.text(resultX + 80, contentY + 60, `LAPS: ${totalLaps}/${totalLaps}`, {
        fontSize: "22px",
        color: "#cccccc",
      });
      resultCard.setStrokeStyle(5, 0xffd54f);

      for (let i = 0; i < 120; i++) {
        const confetti = scene.add.rectangle(
          Phaser.Math.Between(0, scene.scale.width),
          -20,
          Phaser.Math.Between(4, 10),
          Phaser.Math.Between(8, 16),
          Phaser.Display.Color.RandomRGB().color,
        );

        scene.tweens.add({
          targets: confetti,
          y: scene.scale.height + 50,
          x: confetti.x + Phaser.Math.Between(-120, 120),
          angle: Phaser.Math.Between(0, 360),
          duration: Phaser.Math.Between(2500, 4500),
          delay: Phaser.Math.Between(0, 1200),
          onComplete: () => confetti.destroy(),
        });
      }

      // --- Buttons: shifted up and into the left column of the card ---
      const buttonBg = scene.add.graphics();
      const btnX = resultX - 180;
      const btnY = contentY - 70;
      const btnWidth = 320;
      const btnHeight = 75;

      buttonBg.fillStyle(0x000000, 0.35);
      buttonBg.fillRoundedRect(
        btnX - btnWidth / 2 + 6,
        btnY - btnHeight / 2 + 8,
        btnWidth,
        btnHeight,
        18,
      );

      buttonBg.fillStyle(0xc62828, 1);
      buttonBg.fillRoundedRect(
        btnX - btnWidth / 2,
        btnY - btnHeight / 2,
        btnWidth,
        btnHeight,
        18,
      );

      buttonBg.fillStyle(0xff6f61, 0.55);
      buttonBg.fillRoundedRect(
        btnX - btnWidth / 2 + 6,
        btnY - btnHeight / 2 + 6,
        btnWidth - 12,
        24,
        12,
      );

      buttonBg.lineStyle(4, 0xffd54f, 1);
      buttonBg.strokeRoundedRect(
        btnX - btnWidth / 2,
        btnY - btnHeight / 2,
        btnWidth,
        btnHeight,
        18,
      );

      restartButton = scene.add
        .text(btnX, btnY, "↻ RESTART RACE", {
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#7f0000",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const quitBg = scene.add.graphics();
      const quitY = contentY + 30;

      quitBg.fillStyle(0x000000, 0.35);
      quitBg.fillRoundedRect(
        btnX - btnWidth / 2 + 6,
        quitY - btnHeight / 2 + 8,
        btnWidth,
        btnHeight,
        18,
      );

      quitBg.fillStyle(0xc62828, 1);
      quitBg.fillRoundedRect(
        btnX - btnWidth / 2,
        quitY - btnHeight / 2,
        btnWidth,
        btnHeight,
        18,
      );

      quitBg.fillStyle(0xff6f61, 0.55);
      quitBg.fillRoundedRect(
        btnX - btnWidth / 2 + 6,
        quitY - btnHeight / 2 + 6,
        btnWidth - 12,
        24,
        12,
      );

      quitBg.lineStyle(4, 0xffd54f, 1);
      quitBg.strokeRoundedRect(
        btnX - btnWidth / 2,
        quitY - btnHeight / 2,
        btnWidth,
        btnHeight,
        18,
      );

      const quitButton = scene.add
        .text(btnX, quitY, "X  QUIT", {
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffffff",
          stroke: "#7f0000",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      quitButton.on("pointerdown", () => {
        onQuit();
      });

      restartButton.on("pointerdown", () => {
        p1Lap = 0;
        p2Lap = 0;
        p1PassedCheckpoint = false;
        p2PassedCheckpoint = false;
        p1CanCountLap = false;
        p2CanCountLap = false;
        raceStarted = false;
        raceFinished = false;
        raceStartedMoving = false;
        scene.scene.restart();
      });
    }

    function update() {
      if (!raceStarted) {
        p1.setVelocity(0, 0);
        p2.setVelocity(0, 0);
        return;
      }

      const carsMoving = p1.body.speed > 8 || p2.body.speed > 8;
      if (carsMoving) {
        if (idleEngineAudio.isPlaying) {
          idleEngineAudio.stop();
        }
        if (!engineRunAudio.isPlaying) {
          engineRunAudio.play();
        }
      } else {
        if (engineRunAudio.isPlaying) {
          engineRunAudio.stop();
        }
        if (!idleEngineAudio.isPlaying && raceStarted && !raceFinished) {
          idleEngineAudio.play();
        }
      }
      const controlPressed =
        keys.left.isDown ||
        keys.right.isDown ||
        keys.down.isDown ||
        cursors.left.isDown ||
        cursors.right.isDown ||
        cursors.down.isDown;

      if (controlPressed) {
        if (!controlAudio.isPlaying) {
          controlAudio.play();
        }
      } else {
        if (controlAudio.isPlaying) {
          controlAudio.stop();
        }
      }

      const moveCar = (car, controls) => {
        const accel = 20;
        const friction = 0.9;
        const normalMax = 260;
        const offTrackMax = 120;

        let vx = car.body.velocity.x;
        let vy = car.body.velocity.y;
        let minOff = Infinity;

        for (const p of trackPoints) {
          const dist = Phaser.Math.Distance.Between(car.x, car.y, p.x, p.y);
          if (dist < minOff) minOff = dist;
        }

        const offTrack = minOff > 48;
        let maxSpeed = offTrack ? offTrackMax : normalMax;
        if (controls.left.isDown) {
          vx -= accel;
        } else if (controls.right.isDown) {
          vx += accel;
        } else {
          vx *= friction;
        }
        if (controls.up.isDown) {
          vy -= accel;
        } else if (controls.down.isDown) {
          vy += accel;
        } else {
          vy *= friction;
        }
        vx = Phaser.Math.Clamp(vx, -maxSpeed, maxSpeed);
        vy = Phaser.Math.Clamp(vy, -maxSpeed, maxSpeed);
        if (offTrack) {
          vx *= -0.45;
          vy *= -0.45;
          const nearest = trackPoints.reduce((closest, point) => {
            const d = Phaser.Math.Distance.Between(
              car.x,
              car.y,
              point.x,
              point.y,
            );
            if (!closest || d < closest.dist) {
              return { point, dist: d };
            }
            return closest;
          }, null);
          if (nearest) {
            car.x += (nearest.point.x - car.x) * 0.12;
            car.y += (nearest.point.y - car.y) * 0.12;
          }
        }
        if (Math.abs(vx) < 2) vx = 0;
        if (Math.abs(vy) < 2) vy = 0;
        car.setVelocity(vx, vy);
      };
      moveCar(p1, {
        up: keys.up,
        down: keys.down,
        left: keys.left,
        right: keys.right,
      });
      moveCar(p2, {
        up: cursors.up,
        down: cursors.down,
        left: cursors.left,
        right: cursors.right,
      });

      const checkpoints = {
        monza: { x: this.scale.width * 0.2, y: this.scale.height * 0.25 },
        melbourne: { x: this.scale.width * 0.08, y: this.scale.height * 0.3 },
        singapore: { x: this.scale.width * 0.06, y: this.scale.height * 0.5 },
        miami: { x: this.scale.width * 0.12, y: this.scale.height * 0.75 },
        british: { x: this.scale.width * 0.92, y: this.scale.height * 0.78 },
        belgian: { x: this.scale.width * 0.82, y: this.scale.height * 0.1 },
        austria: { x: this.scale.width * 0.12, y: this.scale.height * 0.2 },
        monaco: { x: this.scale.width * 0.95, y: this.scale.height * 0.3 },
        hungary: { x: this.scale.width * 0.2, y: this.scale.height * 0.1 },
        lasvegas: { x: this.scale.width * 0.08, y: this.scale.height * 0.58 },
        qatar: { x: this.scale.width * 0.88, y: this.scale.height * 0.12 },
        abudhabi: { x: this.scale.width * 0.94, y: this.scale.height * 0.08 },
      };

      const checkpoint = checkpoints[selectedTrack];
      const p1NearCheckpoint =
        Phaser.Math.Distance.Between(p1.x, p1.y, checkpoint.x, checkpoint.y) <
        90;
      const p2NearCheckpoint =
        Phaser.Math.Distance.Between(p2.x, p2.y, checkpoint.x, checkpoint.y) <
        90;
      if (p1NearCheckpoint) {
        p1PassedCheckpoint = true;
      }
      if (p2NearCheckpoint) {
        p2PassedCheckpoint = true;
      }

      const finishPositions = {
        monza: {
          x: this.scale.width * 0.7,
          y: this.scale.height * 0.77,
        },

        melbourne: {
          x: this.scale.width * 0.72,
          y: this.scale.height * 0.82,
        },

        singapore: {
          x: this.scale.width * 0.9,
          y: this.scale.height * 0.71,
        },

        miami: {
          x: this.scale.width * 0.56,
          y: this.scale.height * 0.36,
        },

        british: {
          x: this.scale.width * 0.38,
          y: this.scale.height * 0.07,
        },
        belgian: {
          x: this.scale.width * 0.24,
          y: this.scale.height * 0.82,
        },
        austria: {
          x: this.scale.width * 0.63,
          y: this.scale.height * 0.74,
        },
        monaco: {
          x: this.scale.width * 0.33,
          y: this.scale.height * 0.26,
        },
        hungary: {
          x: this.scale.width * 0.79,
          y: this.scale.height * 0.94,
        },
        lasvegas: {
          x: this.scale.width * 0.66,
          y: this.scale.height * 0.11,
        },
        qatar: {
          x: this.scale.width * 0.42,
          y: this.scale.height * 0.78,
        },
        abudhabi: {
          x: this.scale.width * 0.5,
          y: this.scale.height * 0.66,
        },
      };

      const finishX = finishPositions[selectedTrack].x;
      const finishY = finishPositions[selectedTrack].y;
      const p1NearFinish =
        Phaser.Math.Distance.Between(
          p1.x,
          p1.y,
          finishX,
          finishY,
        ) < 90;

      const p2NearFinish =
        Phaser.Math.Distance.Between(
          p2.x,
          p2.y,
          finishX,
          finishY,
        ) < 90;
      if (!raceStartedMoving && (!p1NearFinish || !p2NearFinish)) {
        raceStartedMoving = true;
      }
      if (raceStartedMoving) {
        if (!p1NearFinish) {
          p1CanCountLap = true;
        }
        if (!p2NearFinish) {
          p2CanCountLap = true;
        }
      }
      if (p1PassedCheckpoint && p1CanCountLap && p1NearFinish) {
        p1Lap++;
        p1CanCountLap = false;
        p1PassedCheckpoint = false;
        lapText.setText(
          `${player1Name}: ${p1Lap}/${totalLaps}   ${player2Name}: ${p2Lap}/${totalLaps}`,
        );
        if (p1Lap >= totalLaps) {
          declareWinner(this, 1);
        }
      }

      if (p2PassedCheckpoint && p2CanCountLap && p2NearFinish) {
        p2Lap++;
        p2CanCountLap = false;
        p2PassedCheckpoint = false;
        lapText.setText(
          `${player1Name}: ${p1Lap}/${totalLaps}   ${player2Name}: ${p2Lap}/${totalLaps}`,
        );
        if (p2Lap >= totalLaps) {
          declareWinner(this, 2);
        }
      }
    }
    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        initializedRef.current = false;
      }
    };
  }, [player1Car, player2Car, player1Name, player2Name]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
      }}
    />
  );
}