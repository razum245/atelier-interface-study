'use strict';
window.ATELIER_PRODUCTS = Object.freeze([
  {id:'coat-ivory',name:'Пальто Ivory',category:'outer',categoryLabel:'Верхняя одежда',price:28900,image:'./assets/look1.webp',tag:'NEW',material:'Шерсть с добавлением вискозы',desc:'Объёмное молочное пальто с мягкой линией плеча и выразительным воротником.'},
  {id:'dress-midnight',name:'Платье Midnight',category:'dresses',categoryLabel:'Платья',price:17400,image:'./assets/look2.webp',tag:'EDITORS PICK',material:'Сатин',desc:'Чёрное платье-комбинация с мягкой драпировкой. Лаконичный вечерний силуэт.'},
  {id:'knit-cocoa',name:'Комплект Cocoa',category:'knitwear',categoryLabel:'Трикотаж',price:15600,image:'./assets/look3.webp',tag:'ESSENTIAL',material:'Шерсть, хлопок',desc:'Молочный фактурный джемпер и широкие шоколадные брюки для повседневного образа.'},
  {id:'trench-heritage',name:'Тренч Heritage',category:'outer',categoryLabel:'Верхняя одежда',price:24100,image:'./assets/look4.webp',tag:'CLASSIC',material:'Хлопок с водоотталкивающей пропиткой',desc:'Двубортный бежевый тренч с поясом и чёткими линиями кроя.'},
  {id:'set-monochrome',name:'Комплект Monochrome',category:'sets',categoryLabel:'Комплекты',price:14900,image:'./assets/look5.webp',tag:'BESTSELLER',material:'Хлопок, костюмная ткань',desc:'Белая рубашка свободного кроя и чёрная юбка плиссе с ремнём.'},
  {id:'suit-charcoal',name:'Костюм Charcoal',category:'sets',categoryLabel:'Комплекты',price:19800,image:'./assets/look6.webp',tag:'TAILORED',material:'Костюмная шерсть',desc:'Графитовый жакет укороченного кроя и прямые брюки с высокой посадкой.'},
  {id:'knit-taupe',name:'Комплект Taupe',category:'knitwear',categoryLabel:'Трикотаж',price:16400,image:'./assets/look7.webp',tag:'SOFT EDIT',material:'Шерсть, вискоза',desc:'Свободный кардиган и юбка миди в мягком серо-бежевом оттенке.'},
  {id:'dress-bordeaux',name:'Платье Bordeaux',category:'dresses',categoryLabel:'Платья',price:21200,image:'./assets/look8.webp',tag:'OCCASION',material:'Плотный вискозный креп',desc:'Бордовое платье с драпировкой и выразительным боковым разрезом.'}
]);
window.ATELIER_TASKS = Object.freeze([
  {id:1,text:'Найдите и откройте карточку товара «Платье Bordeaux».',event:'detail',productId:'dress-bordeaux'},
  {id:2,text:'Добавьте «Комплект Monochrome» в избранное.',event:'favorite',productId:'set-monochrome'},
  {id:3,text:'Добавьте «Комплект Taupe» в корзину и завершите демонстрационное оформление.',event:'checkout',productId:'knit-taupe'}
]);
