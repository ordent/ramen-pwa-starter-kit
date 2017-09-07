const styleElement = document.createElement('dom-module');
styleElement.innerHTML = 
  `<template>
    <style>
    :host {
  display: block; }

    </style>
  </template>`;
styleElement.register('global-styles');
