const styleElement = document.createElement('dom-module');
styleElement.innerHTML = 
  `<template>
    <style>
    <%= css %>
    </style>
  </template>`;
styleElement.register('global-styles');
