import { CERTIFICATES } from "./cert-data.js";

export const state = {
  filtered: [...CERTIFICATES],
  current: 0,
  animating: false,
  autoPlayTimer: null,
  autoPlayEnabled: true,
};

export const AUTO_PLAY_INTERVAL = 5000;

export const els = {
  book: document.getElementById("certBook"),
  leftContent: document.getElementById("pageLeftContent"),
  rightContent: document.getElementById("pageRightContent"),
  flipLayer: document.getElementById("bookFlipLayer"),
  flipFront: document.getElementById("flipFaceFront"),
  flipBack: document.getElementById("flipFaceBack"),
  counter: document.getElementById("certCounter"),
  dotNav: document.getElementById("certDotNav"),
  prevBtn: document.getElementById("certPrevBtn"),
  nextBtn: document.getElementById("certNextBtn"),
  progressBar: document.getElementById("certProgressBar"),
  autoPlayBtn: document.getElementById("certAutoPlayBtn"),
  lightbox: document.getElementById("certLightbox"),
  lightboxImg: document.getElementById("certLightboxImg"),
  lightboxTitle: document.getElementById("certLightboxTitle"),
  lightboxClose: document.getElementById("certLightboxClose"),
};
