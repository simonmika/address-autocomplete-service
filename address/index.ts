import * as azure from "@azure/functions"
import { default as fetch } from "node-fetch"
import * as GooglePlaces from "./GooglePlaces"

export default async function(context: azure.Context, req: azure.HttpRequest) {
	if (context.bindingData.street) {
		let input = context.bindingData.street
		if (req.query.town)
			input += `, ${req.query.town}`
		if (req.query.country)
			input += `, ${req.query.country}`
		const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=address&language=sv&key=${process.env.GooglePlacesApiKey}`)
		context.res = {
			status: response.status,
			body: (await response.json() as GooglePlaces.PredictionResponse).predictions.map(prediction =>
				prediction.terms.length == 3 ? { street: prediction.terms[0].value, town: prediction.terms[1].value, country: prediction.terms[2].value } :
				prediction.terms.length == 4 ? { street: `${prediction.terms[0].value} ${prediction.terms[1].value}`, town: prediction.terms[2].value, country: prediction.terms[3].value } :
				{ street: prediction.description }),
		}
	}
	else {
		context.res = {
			status: 400,
			body: "Please pass a name on the query string or in the request body",
		}
	}
}
