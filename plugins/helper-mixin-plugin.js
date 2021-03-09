import Vue from 'vue'
import { format, parseISO } from 'date-fns'
import { padStart, findIndex, isEmpty } from 'lodash'

if (!Vue.__helper__mixin__) {
  Vue.__helper__mixin__ = true

  Vue.mixin({
    methods: {
      toCurrency(value) {
        if (isNaN(value)) {
          return '--'
        } else {
          return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
          }).format(value)
        }
      },
      toNumberFormat(value) {
        if (isNaN(value)) {
          return '--'
        } else {
          return new Intl.NumberFormat('en-PH', {
            style: 'decimal',
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
          }).format(value)
        }
      },
      toFixed(val) {
        if (val) {
          return Number(val.toFixed(2))
        } else {
          return 0
        }
      },
      parseDate(date) {
        if (!date) {
          return null
        }

        if (parseISO(date)) {
          return date
        }
        const [month, day, year] = date.split('/')

        return `${year}-${padStart(month, 2, '0')}-${padStart(day, 2, '0')}`
      },
      formatDate(date, formatStr) {
        if (!date) {
          return null
        }
        if (typeof date === 'string') {
          date = parseISO(date)
        }

        if (!formatStr) {
          formatStr = 'MM/dd/yyyy'
        }

        return format(date, formatStr)
      },
      showFab(button, state) {
        const btns = {
          pre_new: [],
          new: ['undo'],
          edited: ['undo'],
          deleted: ['undo'],
          '': ['edit', 'delete'],
        }

        return findIndex(btns[state], (r) => r === button) > -1
      },
      rowClass(item) {
        const rowClass = {
          '': '',
          pre_new: 'teal lighten-5',
          new: 'green accent-1',
          edited: 'blue accent-1',
          deleted: 'red accent-1',
        }

        return rowClass[item._state]
      },
      padStart(string, length, char) {
        return padStart(string, length, char)
      },
      getRandomInt(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
      },
      getImage(item) {
        if (item.img) {
          return 'data: ' + item.image_mime + ';base64, ' + item.image_base64
        } else {
          return '/preload.png'
        }
      },
      isEmpty(val) {
        return isEmpty(val)
      },
      imageToDataUrl(imgSrc) {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const image = new Image()
        image.src = imgSrc
        context.drawImage(image, 0, 0)

        return canvas.toDataURL()
      },
    },
  })
}
