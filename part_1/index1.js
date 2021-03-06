/**
 * @license
 * Copyright 2019 AI Lab - Telkom University. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import 'bootstrap/dist/css/bootstrap.css'
import $ from 'jquery'
import * as tf from '@tensorflow/tfjs'
import * as tfvis from '@tensorflow/tfjs-vis'
import Chart from 'chart.js'


//PART 1
const arr_x = [-1, -2,  0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 6]
const arr_y = [-1, -2, -1, 1, 1, 0, 2, 3, 1, 3, 2, 4, 3, 6, 5]

let zip = (arr1, arr2) => arr1.map((x, i) => { return {'x':x, 'y':arr2[i]}})
const toy_data = zip(arr_x, arr_y)
const label = 'toy data'

// CHART.JS VIS
var ctx = $('#scatter-chartjs')
var scatterChart = new Chart(ctx, {
    type: 'bubble',
    data: {
        datasets: [{
            data : toy_data,
            label: label,
            backgroundColor: 'red'}]
    },
    options: {
        responsive: false
    }
})

const x = tf.tensor2d(arr_x, [15, 1])
const y = tf.tensor2d(arr_y, [15, 1])


function viewPrediction(model){    
    let t_pred = model.predict(x)
    let y_pred = t_pred.dataSync()
    let ar_pred = zip(arr_x, y_pred)
    
    scatterChart.destroy()
    scatterChart = new Chart(ctx, {
    type: 'bubble',
    data: {
        labels: arr_x,
        datasets: [
            {
                type : 'line',
                label: 'prediction',
                data : ar_pred,
                fill : false,
                borderColor: 'blue',
                pointRadius: 0
            }, {
                type : 'bubble',
                label: 'training data',
                data : toy_data,
                backgroundColor: 'red',
                borderColor: 'transparent'
            }
        ]
    },
    options: { responsive: false }
    })
}




let model = tf.sequential()

$('#init-btn').click(function() {
    model.add(tf.layers.dense({units: 1, inputShape: [1]}))
    model.compile({loss: 'meanSquaredError', optimizer: 'sgd'})    
    
    //const mySGD = tf.train.sgd(0.1)
    //model.compile({loss: 'meanSquaredError', optimizer: mySGD})

    viewPrediction(model)
    $('#train-btn').prop('disabled', false)
})

$('#train-btn').click(function() {    
    var msg = $('#is-training')
    msg.toggleClass('badge-warning')    
    msg.text('Training, please wait...')    
    
    model.fit(x, y, {epochs: 20}).then((hist) => {    
        let mse = model.evaluate(x, y)
        
        viewPrediction(model)
        msg.removeClass('badge-warning').addClass('badge-success')
        msg.text('MSE: '+mse.dataSync())
        $('#predict-btn').prop('disabled', false)
        
        const surface = tfvis.visor().surface({ name: 'Training History', tab: 'MSE' })    
        tfvis.show.history(surface, hist, ['loss'])        

    })
})

$('#predict-btn').click(function() {
    var num = parseFloat($('#inputValue').val())
    let y_pred = model.predict(tf.tensor2d([num], [1,1]))
    $('#output').text(y_pred.dataSync())
})


// @author ANDITYA ARIFIANTO
// AI LAB - 2019