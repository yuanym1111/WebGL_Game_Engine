//////////////////////////////////////////////////////////////////////////
//						RAY												//
//////////////////////////////////////////////////////////////////////////


Ray = function(ray){
	this.org = ray ? ray.org : $V([0.0,0.0,0.0]);
	this.dir = ray ? ray.dir : $V([0.0,0.0,0.0]);
}

Ray.prototype.create = function(org,dir){
	
	this.org = org;
	this.dir = dir;
}

Ray.prototype.intersectionAABB = function(box){
	
	if(!box){return false;}
	
	var l = Line.create(this.org,this.dir);
	
	//Front Face 
	var a1 = box.max;
	
//	var a2 = $V([box.max.e(1),box.min.e(2),box.max.e(3)]);
//	var a3 = $V([box.min.e(1),box.min.e(2),box.max.e(3)]);
//	var a4 = $V([box.min.e(1),box.max.e(2),box.max.e(3)]);
	
	var normalFront = $V([0,0,1]);
	var p = Plane.create(a1, normalFront);
	
	if (l.intersects(p)) {
		var intersectionPt = l.intersectionWith(p);
		if ((intersectionPt.e(1) >= box.min.e(1)) && (intersectionPt.e(1) <= box.max.e(1)) &&
		    (intersectionPt.e(2) >= box.min.e(2)) && (intersectionPt.e(2) <= box.max.e(2)) ) {
			
	//		console.log(intersectionPt.e(1)+" "+intersectionPt.e(2));
		    return true;        // intersection point is on the cubes front face
		}
	}
	
	return false;
	
}

Ray.prototype.intersectionTriangle = function(triangle){
	
}